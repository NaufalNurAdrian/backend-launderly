import prisma from "../../../prisma";
import { OrderStatus, DeliveryStatus } from "../../../../prisma/generated/client";
interface updateOrderData {
  workerId: number;
  orderId: number;
}

export const updateOrderStatus = async (query: updateOrderData) => {
  const { workerId, orderId } = query;
  try {
    const worker = await prisma.employee.findUnique({
      where: { userId: workerId },
    });

    if (!worker) {
      throw new Error("Worker not found");
    }

    const orderWorker = await prisma.orderWorker.findFirst({
      where: {
        orderId: orderId,
        workerId: worker.id,
        isComplete: false,
      },
    });

    if (!orderWorker) {
      throw new Error("No active order found for this worker");
    }

    if (orderWorker.bypassRequest) {
      if (orderWorker.bypassAccepted === null) {
        throw new Error("Bypass request is still pending");
      } else if (orderWorker.bypassAccepted === true) {
        throw new Error("Bypass request has been accepted. You are no longer assigned to this order.");
      } else if (orderWorker.bypassAccepted === false) {
      }
    }

    let newStatus: OrderStatus;
    if (worker.station === "WASHING") {
      newStatus = OrderStatus.WASHING_COMPLETED;
    } else if (worker.station === "IRONING") {
      newStatus = OrderStatus.IRONING_COMPLETED;
    } else if (worker.station === "PACKING") {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: {
          isPaid: true,
          pickupOrder: {
            select: {
              outletId: true,
              userId: true,
              addressId: true,
              distance: true,
            },
          },
        },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      newStatus = order.isPaid
        ? OrderStatus.WAITING_FOR_DELIVERY_DRIVER
        : OrderStatus.AWAITING_PAYMENT;

      const deliveryOrder = await prisma.deliveryOrder.update({
        where: {orderId: orderId},
        data: {
          orderId: orderId,
          deliveryStatus: order.isPaid
            ? DeliveryStatus.WAITING_FOR_DRIVER
            : DeliveryStatus.NOT_READY_TO_DELIVER,
          driverId: null,
        },
      });
    } else {
      throw new Error("Invalid worker station");
    }

    const completedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: newStatus },
    });

    const updatedWorkerOrder = await prisma.orderWorker.update({
      where: {
        id: orderWorker.id,
      },
      data: { isComplete: true },
    });
    const station: string = worker.station as string;

    const nextStation =
      station === "WASHING"
        ? "IRONING"
        : station === "IRONING"
        ? "PACKING"
        : null;

    if (nextStation) {
      const usersInNextStation = await prisma.employee.findMany({
        where: { station: nextStation },
        select: { userId: true },
      });

      const notification = await prisma.notification.create({
        data: {
          title: `Incoming order`,
          description: `The order is ready to be processed at the ${nextStation.toLowerCase()} station.`,
        },
      });

      for (const user of usersInNextStation) {
        await prisma.userNotification.create({
          data: {
            userId: user.userId,
            notificationId: notification.id,
          },
        });
      }
    }

    return { order: completedOrder, detail: updatedWorkerOrder };
  } catch (error) {
    throw error;
  }
};