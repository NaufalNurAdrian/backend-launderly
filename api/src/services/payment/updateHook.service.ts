import prisma from "../../prisma";
import { PaymentStatus, OrderStatus, DeliveryStatus } from "@prisma/client";

interface UpdatePaymentBody {
  order_id: string;
  transaction_status: string;
  payment_type?: string;
}

export const updateHooktStatus = async (body: UpdatePaymentBody) => {
  try {
    console.log("Received webhook payload:", JSON.stringify(body, null, 2));

    const { order_id, transaction_status, payment_type } = body;

    if (!order_id || !transaction_status) {
      console.error(
        "Invalid request: order_id and transaction_status are required"
      );
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

    console.log(`Mapped payment status: ${paymentStatus}`);

    // Cari invoice berdasarkan order_id
    console.log(`Searching for invoice with order_id: ${order_id}`);
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

    console.log("Found invoice:", existingInvoice);

    // Cari apakah ada delivery order yang sesuai dengan orderId
    console.log(
      `Checking if delivery order exists for orderId: ${existingInvoice.orderId}`
    );
    const existingDeliveryOrder = await prisma.deliveryOrder.findUnique({
      where: { orderId: existingInvoice.orderId }, // Fix: gunakan orderId
    });

    if (!existingDeliveryOrder) {
      console.warn(
        `No delivery order found for orderId: ${existingInvoice.orderId}, skipping update`
      );
    }

    let newOrderStatus: OrderStatus | undefined;
    let newDeliveryStatus: DeliveryStatus | undefined;

    if (paymentStatus === PaymentStatus.SUCCESSED) {
      console.log(
        `Checking order status for payment success: ${existingInvoice.order.orderStatus}`
      );
      if (existingInvoice.order.orderStatus === OrderStatus.AWAITING_PAYMENT) {
        console.log(
          "Updating order status to READY_FOR_DELIVERY and delivery status to WAITING_FOR_DRIVER"
        );
        newOrderStatus = OrderStatus.READY_FOR_DELIVERY;
        newDeliveryStatus = DeliveryStatus.WAITING_FOR_DRIVER;
      } else {
        console.log(
          "Order status is not AWAITING_PAYMENT, no order status change"
        );
      }
    }

    console.log("Updating database with new statuses...");
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: existingInvoice.id },
        data: { paymentStatus, paymentMethode: payment_type || null },
      }),
      prisma.order.update({
        where: { id: existingInvoice.orderId },
        data: {
          ...(newOrderStatus ? { orderStatus: newOrderStatus } : {}),
          ...(paymentStatus === PaymentStatus.SUCCESSED
            ? { isPaid: true }
            : {}),
        },
      }),
      ...(newDeliveryStatus
        ? [
            prisma.deliveryOrder.update({
              where: { orderId: existingInvoice.orderId },
              data: { deliveryStatus: newDeliveryStatus },
            }),
          ]
        : []),
    ]);

    console.log(
      `Payment updated for order ${order_id}. New status: ${newOrderStatus}, Delivery: ${newDeliveryStatus}`
    );

    return { message: "Payment updated successfully" };
  } catch (error) {
    console.error(
      `Error updating payment for order_id=${body.order_id}:`,
      error
    );
    throw error;
  }
};
