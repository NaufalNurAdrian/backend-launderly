import { generateOrderNumber } from "../../../helpers/numberGenerator";
import prisma from "../../../prisma";
<<<<<<< HEAD
import { OrderStatus, DeliveryStatus } from ".prisma/client";
=======
import { OrderStatus, DeliveryStatus } from "@prisma/client";
>>>>>>> 4c228e42da5306600049dac9c91678d1ec254b40

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
<<<<<<< HEAD
        console.log("Bypass request pending");
        throw new Error("Bypass request is still pending");
      } else if (orderWorker.bypassAccepted === true) {
        console.log("Bypass request accepted");
        throw new Error("Bypass request has been accepted. You are no longer assigned to this order.");
      } else if (orderWorker.bypassAccepted === false) {
        console.log("Bypass request was rejected. Continuing process...");
=======
        throw new Error("Bypass request is still pending");
      } else if (orderWorker.bypassAccepted === true) {
        throw new Error("Bypass request has been accepted. You are no longer assigned to this order.");
      } else if (orderWorker.bypassAccepted === false) {
>>>>>>> 4c228e42da5306600049dac9c91678d1ec254b40
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

<<<<<<< HEAD
      newStatus = order.isPaid ? OrderStatus.WAITING_FOR_DELIVERY_DRIVER : OrderStatus.AWAITING_PAYMENT;
      const deliveryNumber = await generateOrderNumber("DLV");

      const deliveryOrder = await prisma.deliveryOrder.create({
=======
      newStatus = order.isPaid
        ? OrderStatus.WAITING_FOR_DELIVERY_DRIVER
        : OrderStatus.AWAITING_PAYMENT;

      const deliveryOrder = await prisma.deliveryOrder.update({
        where: {orderId: orderId},
>>>>>>> 4c228e42da5306600049dac9c91678d1ec254b40
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

<<<<<<< HEAD
    const nextStation = station === "WASHING" ? "IRONING" : station === "IRONING" ? "PACKING" : null;
=======
    const nextStation =
      station === "WASHING"
        ? "IRONING"
        : station === "IRONING"
        ? "PACKING"
        : null;
>>>>>>> 4c228e42da5306600049dac9c91678d1ec254b40

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
