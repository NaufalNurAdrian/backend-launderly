import prisma from "../../prisma";
import { MidtransClient } from "midtrans-node-client";

const snap = new MidtransClient.Snap({
  isProduction: false,
  clientKey: process.env.MIDTRANS_PUBLIC_CLIENT,
  serverKey: process.env.MIDTRANS_SECRET,
});

interface createPaymentArgs {
  orderId: number;
}

export const createPaymentService = async (body: createPaymentArgs) => {
  try {
    const { orderId } = body;

    const existingOrder = await prisma.order.findFirst({
      where: { id: orderId },
      include: { pickupOrder: true, deliveryOrder: true },
    });

    if (!existingOrder) {
      throw new Error("Order Not Found!");
    }

    if (!existingOrder.laundryPrice) {
      throw new Error("Order Not Yet Process by Admin");
    }

    if (!existingOrder.deliveryOrder[0].deliveryPrice) {
      throw new Error("No Delivery Order Found!");
    }

    if (existingOrder.isPaid === true) {
      const successPayment = await prisma.payment.findFirst({
        where: { orderId: orderId, paymentStatus: "SUCCESSED" },
      });
      return successPayment;
    }

    if (existingOrder.isPaid === false) {
      const outstandingPayment = await prisma.payment.findFirst({
        where: {
          orderId: orderId,
          paymentStatus: "PENDING",
          snapToken: { not: null },
        },
      });
      if (outstandingPayment) {
        return outstandingPayment;
      } else {
        const amount =
          existingOrder.laundryPrice +
          existingOrder.pickupOrder.pickupPrice +
          existingOrder.deliveryOrder[0].deliveryPrice;

        const padNumber = (num: number, size: number): string => {
          let s = num.toString();
          while (s.length < size) s = "0" + s;
          return s;
        };

        const orderNumberParts = existingOrder.orderNumber.split("-");
        const orderNumberPart = orderNumberParts.pop();

        const lastInvoice = await prisma.payment.findFirst({
          where: {
            invoiceNumber: {
              contains: `INV-${padNumber(
                existingOrder.pickupOrder.userId,
                4
              )}-${orderNumberPart}-`,
            },
          },
          orderBy: {
            invoiceNumber: "desc",
          },
        });

        const getNextInvoiceNumber = (
          lastInvoice: { invoiceNumber: string } | null
        ): string => {
          if (!lastInvoice) {
            return padNumber(1, 4);
          }

          const invoiceParts = lastInvoice.invoiceNumber.split("-");
          const lastPart = invoiceParts.pop();

          if (!lastPart) {
            throw new Error("Invalid invoice number format");
          }

          const lastNumber = parseInt(lastPart, 10);

          if (isNaN(lastNumber)) {
            throw new Error(
              "Last part of the invoice number is not a valid number"
            );
          }

          return padNumber(lastNumber + 1, 4);
        };

        const nextIncrement = getNextInvoiceNumber(lastInvoice);

        const invoiceNumber = `INV-${padNumber(
          existingOrder.pickupOrder.userId,
          4
        )}-${orderNumberPart}-${nextIncrement}`;

        const createPayment = await prisma.payment.create({
          data: {
            orderId: orderId,
            invoiceNumber: String(invoiceNumber),
            amount: amount,
          },
        });

        const payload = {
          transaction_details: {
            order_id: createPayment.invoiceNumber,
            gross_amount: amount,
          },
        };

        const transaction = await snap.createTransaction(payload);

        const updatePaymentToken = await prisma.payment.update({
          where: { id: createPayment.id },
          data: {
            snapToken: transaction.token,
            snapRedirectUrl: transaction.redirect_url,
          },
        });
        return updatePaymentToken;
      }
    }

    return {
      message: "Success",
    };
  } catch (error) {
    throw error;
  }
};
