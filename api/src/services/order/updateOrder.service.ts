import prisma from "../../prisma";
import { EmployeeWorkShift, Order, OrderStatus } from "@prisma/client";

interface UpdateOrderBody extends Pick<Order, "weight"> {
  orderItem: { qty: string; laundryItemId: string }[];
  orderNumber: string;
}

export const UpdateOrderService = async (body: UpdateOrderBody) => {
  try {
    const { weight, orderNumber, orderItem } = body;

    const existingOrder = await prisma.order.findFirst({
      where: { orderNumber: orderNumber },
      select: {
        id: true,
        pickupOrder: { select: { outletId: true, pickupNumber: true } },
      },
    });

    if (!existingOrder) {
      throw new Error("Order Not Found!");
    }

    if (!weight) {
      throw new Error("Weight is required");
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const addDataOrder = await tx.order.update({
        where: {
          id: existingOrder.id,
        },
        data: {
          weight: Number(weight),
          laundryPrice: Number(weight * 6000),
          orderStatus: OrderStatus.READY_FOR_WASHING,
        },
      });

      const addDataOrderItems = await Promise.all(
        orderItem.map(async (item) => {
          return await tx.orderItem.create({
            data: {
              orderId: addDataOrder.id,
              qty: Number(item.qty),
              laundryItemId: Number(item.laundryItemId),
            },
          });
        })
      );

      const updateDataPickupOrder = await tx.pickupOrder.update({
        where: { pickupNumber: existingOrder.pickupOrder?.pickupNumber },
        data: {
          isOrderCreated: true,
        },
      });

      const now = new Date();
      const currentHour = now.getUTCHours() + 7;
      let setWorkShift =
        currentHour >= 6 && currentHour < 18
          ? EmployeeWorkShift.DAY
          : EmployeeWorkShift.NIGHT;

      const createNotification = await tx.notification.create({
        data: {
          title: "Incoming Laundry Task",
          description: "New laundry arrived at washing station",
        },
      });

      const getUserId = await tx.employee.findMany({
        where: {
          outletId: existingOrder.pickupOrder?.outletId,
          workShift: setWorkShift,
          station: "WASHING",
        },
        select: { userId: true },
      });

      const userIds = getUserId.map((user) => user.userId);
      const createUserNotification = await Promise.all(
        userIds.map(async (userId) => {
          await tx.userNotification.create({
            data: {
              notificationId: createNotification.id,
              userId: userId,
            },
          });
        })
      );

      return {
        order: addDataOrder,
        orderItem: addDataOrderItems,
        pickupOrder: updateDataPickupOrder,
        userNotification: createUserNotification,
      };
    });

    return updatedOrder;
  } catch (error) {
    throw error;
  }
};
