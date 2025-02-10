import { generateOrderNumber } from "../../../helpers/numberGenerator";
import prisma from "../../../prisma";
import { OrderStatus, DeliveryStatus } from ".prisma/client";
import haversineDistance from "../../../helpers/haversine";

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

    if (orderWorker.bypassRequest && !orderWorker.bypassAccepted) {
      throw new Error("Bypass request is still pending or rejected");
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
              distance: true
            },
          },
        },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      newStatus = order.isPaid ? OrderStatus.WAITING_FOR_DELIVERY_DRIVER : OrderStatus.AWAITING_PAYMENT;
      const deliveryNumber = await generateOrderNumber("DLV");
     
      const deliveryOrder = await prisma.deliveryOrder.create({
        data: {
          orderId: orderId,
          deliveryNumber: deliveryNumber,
          deliveryStatus: order.isPaid ? DeliveryStatus.WAITING_FOR_DRIVER : DeliveryStatus.NOT_READY_TO_DELIVER,
          createdAt: new Date(),
          deliveryPrice: 20000,
          driverId: null,
          userId: order.pickupOrder.userId,
          addressId: order.pickupOrder.addressId,
          distance: order.pickupOrder.distance,
        },
      });

      console.log("Delivery Order Created:", deliveryOrder);
    } else {
      throw new Error("Invalid worker station");
    }

    const completedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: newStatus },
    });

    const updatedWorkerOrder = await prisma.orderWorker.updateMany({
      where: { orderId: orderId, workerId: worker.id },
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
        title: `Order ${orderId} Ready for ${nextStation}`,
        description: `The order is ready to be processed at the ${nextStation} station.`,
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
