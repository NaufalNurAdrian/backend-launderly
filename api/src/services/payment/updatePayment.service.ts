import prisma from "../../prisma";
import { Prisma, PaymentStatus } from "@prisma/client";

interface UpdatePaymentBody {
  order_id: string;
  transaction_status: string;
  fraud_status?: string;
  payment_type?: string;
  currency?: string;
  status_code?: number;
  signature_key?: string;
}

export const updatePaymentService = async (body: UpdatePaymentBody) => {
  try {
    const { order_id, fraud_status, payment_type, transaction_status } = body;

    if (!order_id || !transaction_status) {
      throw new Error("Invalid request: order_id and transaction_status are required");
    }

    const existingInvoice = await prisma.payment.findUnique({
      where: { invoiceNumber: order_id },
      select: {
        id: true,
        orderId: true,
        order: { select: { orderStatus: true } },
      },
    });

    if (!existingInvoice) {
      throw new Error(`Invoice Not Found: order_id=${order_id}`);
    }
    let paymentStatus: PaymentStatus | undefined;
    let updateOrderStatus = false;

    switch (transaction_status) {
      case "capture":
        if (fraud_status === "accept") {
          paymentStatus = PaymentStatus.SUCCESSED;
          updateOrderStatus = true;
        }
        break;
      case "settlement":
        paymentStatus = PaymentStatus.SUCCESSED;
        updateOrderStatus = true;
        break;
      case "cancel":
        paymentStatus = PaymentStatus.CANCELLED;
        break;
      case "deny":
        paymentStatus = PaymentStatus.DENIED;
        break;
      case "expire":
        paymentStatus = PaymentStatus.EXPIRED;
        break;
      case "pending":
        paymentStatus = PaymentStatus.PENDING;
        break;
      default:
        throw new Error(`Invalid transaction_status received: ${transaction_status}`);
    }

    await prisma.$transaction(async (tx) => {
      if (paymentStatus) {
        await tx.payment.update({
          where: { id: existingInvoice.id },
          data: { 
            paymentStatus, 
            paymentMethode: payment_type || null,
          },
        });
      }

      // Update status order jika perlu
      if (updateOrderStatus) {
        const orderUpdate: Prisma.OrderUpdateInput = { isPaid: true };

        if (existingInvoice.order.orderStatus === "AWAITING_PAYMENT") {
          orderUpdate.orderStatus = "READY_FOR_DELIVERY";
        }

        await tx.order.update({
          where: { id: existingInvoice.orderId },
          data: orderUpdate,
        });
      }
    });

    return { message: "Payment updated successfully" };
  } catch (error) {
    console.error(`Error updating payment for order_id=${body.order_id}:`, error);
    throw error;
  }
};
