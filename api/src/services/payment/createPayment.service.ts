import prisma from "../../prisma";
import { MidtransClient } from "midtrans-node-client";

const snap = new MidtransClient.Snap({
  isProduction: false,
  clientKey: process.env.MID_CLIENT_KEY,
  serverKey: process.env.MID_SERVER_KEY,
});

interface createPaymentArgs {
  orderId: number;
}

export const createPaymentService = async (body: createPaymentArgs) => {
  try {
    const { orderId } = body;
    if (!orderId) throw new Error("Order ID is required");

    const existingOrder = await prisma.order.findFirst({
      where: { id: orderId },
      include: { pickupOrder: true, deliveryOrder: true },
    });

    if (!existingOrder) throw new Error("Order Not Found!");
    if (!existingOrder.laundryPrice) throw new Error("Order Not Yet Processed by Admin");
    if (!existingOrder.pickupOrder) throw new Error("No Pickup Order Found!");
    if (!existingOrder.deliveryOrder.length) throw new Error("No Delivery Order Found!");
    if (!existingOrder.deliveryOrder[0].deliveryPrice) throw new Error("Delivery Price Missing!");

    if (existingOrder.isPaid) {
      return await prisma.payment.findFirst({
        where: { orderId: orderId, paymentStatus: "SUCCESSED" },
      });
    }

    const outstandingPayment = await prisma.payment.findFirst({
      where: {
        orderId: orderId,
        paymentStatus: "PENDING",
        snapToken: { not: null },
      },
    });
    if (outstandingPayment) return outstandingPayment;

    const amount = (existingOrder.laundryPrice || 0) + (existingOrder.pickupOrder.pickupPrice || 0) + (existingOrder.deliveryOrder[0]?.deliveryPrice || 0);

    const padNumber = (num: number, size: number): string => {
      let s = num.toString();
      while (s.length < size) s = "0" + s;
      return s;
    };

    const orderNumberParts = existingOrder.orderNumber.split("-");
    if (orderNumberParts.length < 2) throw new Error("Invalid order number format");
    const orderNumberPart = orderNumberParts.pop();

    const lastInvoice = await prisma.payment.findFirst({
      where: {
        invoiceNumber: {
          contains: `INV-${padNumber(existingOrder.pickupOrder.userId, 4)}-${orderNumberPart}-`,
        },
      },
      orderBy: { invoiceNumber: "desc" },
    });

    const getNextInvoiceNumber = (lastInvoice: { invoiceNumber: string } | null): string => {
      if (!lastInvoice) return padNumber(1, 4);
      const invoiceParts = lastInvoice.invoiceNumber.split("-");
      const lastPart = invoiceParts.pop();
      return lastPart && !isNaN(Number(lastPart)) ? padNumber(Number(lastPart) + 1, 4) : padNumber(1, 4);
    };

    const nextIncrement = getNextInvoiceNumber(lastInvoice);
    const invoiceNumber = `INV-${padNumber(existingOrder.pickupOrder.userId, 4)}-${orderNumberPart}-${nextIncrement}`;

    const createPayment = await prisma.payment.create({
      data: {
        orderId: orderId,
        invoiceNumber: invoiceNumber,
        amount: amount,
      },
    });

    const payload = {
      transaction_details: {
        order_id: createPayment.invoiceNumber,
        gross_amount: amount,
      },
      customer_details: {
        first_name: existingOrder.pickupOrder.userId.toString(),
        last_name: "Customer",
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
  } catch (error) {
    console.error("Error in createPaymentService:", error);
    return { success: false, message: "ada error" };
  }
};
