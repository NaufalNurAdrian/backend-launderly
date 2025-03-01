import prisma from "../../prisma";
import { PaymentStatus, OrderStatus } from "@prisma/client";

interface UpdatePaymentBody {
  order_id: string;
  transaction_status: string;
  payment_type?: string;
}

export const updatePaymentStatus = async (body: UpdatePaymentBody) => {
  try {
    const { order_id, transaction_status, payment_type } = body;

    if (!order_id || !transaction_status) {
      throw new Error(
        "Invalid request: order_id and transaction_status are required"
      );
    }

    // Mapping status Midtrans ke sistem internal
    const statusMapping: { [key: string]: PaymentStatus } = {
      settlement: PaymentStatus.SUCCESSED,
      pending: PaymentStatus.PENDING,
      expire: PaymentStatus.EXPIRED,
      cancel: PaymentStatus.CANCELLED,
      deny: PaymentStatus.DENIED,
    };

    const paymentStatus = statusMapping[transaction_status];

    if (!paymentStatus) {
      console.warn(
        `Received an unknown transaction_status: ${transaction_status}`
      );
      return { message: `Unknown transaction_status: ${transaction_status}` };
    }

    // Cari invoice berdasarkan order_id
    const existingInvoice = await prisma.payment.findUnique({
      where: { invoiceNumber: order_id },
      select: {
        id: true,
        orderId: true,
        order: { select: { orderStatus: true } },
      },
    });

    if (!existingInvoice) {
      console.warn(`Invoice Not Found: ${order_id}`);
      return { message: "Invoice not found", success: false };
    }

    // Cek apakah order status perlu diupdate
    const updateOrderStatus =
      paymentStatus === PaymentStatus.SUCCESSED &&
      existingInvoice.order.orderStatus === OrderStatus.AWAITING_PAYMENT;

    // Jalankan transaksi Prisma
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: existingInvoice.id },
        data: { paymentStatus, paymentMethode: payment_type || null },
      });

      if (updateOrderStatus) {
        await tx.order.update({
          where: { id: existingInvoice.orderId },
          data: { orderStatus: OrderStatus.READY_FOR_DELIVERY, isPaid: true },
        });
      }
    });

    return { message: "Payment updated successfully" };
  } catch (error) {
    console.error(
      `Error updating payment for order_id=${body.order_id}:`,
      error
    );
    throw error;
  }
};
