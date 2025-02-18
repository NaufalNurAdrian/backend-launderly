import prisma from "../../../prisma";
import { createNotificationForNextStation } from "../../notifications/createNotification.service";

enum PickupStatus {
  WAITING_FOR_DRIVER = "WAITING_FOR_DRIVER",
  ON_THE_WAY_TO_CUSTOMER = "ON_THE_WAY_TO_CUSTOMER",
  ON_THE_WAY_TO_OUTLET = "ON_THE_WAY_TO_OUTLET",
  RECEIVED_BY_OUTLET = "RECEIVED_BY_OUTLET",
}

enum DeliveryStatus {
  WAITING_FOR_DELIVERY_DRIVER = "WAITING_FOR_DRIVER",
  ON_THE_WAY_TO_OUTLET = "ON_THE_WAY_TO_OUTLET",
  ON_THE_WAY_TO_CUSTOMER = "ON_THE_WAY_TO_CUSTOMER",
  RECEIVED_BY_CUSTOMER = "RECEIVED_BY_CUSTOMER",
}

enum OrderStatus {
  WAITING_FOR_PICKUP_DRIVER = "WAITING_FOR_PICKUP_DRIVER",
  ON_THE_WAY_TO_CUSTOMER = "ON_THE_WAY_TO_CUSTOMER",
  ON_THE_WAY_TO_OUTLET = "ON_THE_WAY_TO_OUTLET",
  ARRIVED_AT_OUTLET = "ARRIVED_AT_OUTLET",
  WAITING_FOR_DELIVERY_DRIVER = "WAITING_FOR_DELIVERY_DRIVER",
  BEING_DELIVERED_TO_CUSTOMER = "BEING_DELIVERED_TO_CUSTOMER",
  RECEIVED_BY_CUSTOMER = "RECEIVED_BY_CUSTOMER",
  COMPLETED = "COMPLETED",
}

interface UpdateRequestStatusData {
  driverId: number;
  requestId: number;
  type: "pickup" | "delivery";
}

const mapToOrderStatus = (status: PickupStatus | DeliveryStatus): OrderStatus => {
  switch (status) {
    case PickupStatus.WAITING_FOR_DRIVER:
      return OrderStatus.WAITING_FOR_PICKUP_DRIVER;
    case PickupStatus.ON_THE_WAY_TO_CUSTOMER:
      return OrderStatus.ON_THE_WAY_TO_CUSTOMER;
    case PickupStatus.ON_THE_WAY_TO_OUTLET:
      return OrderStatus.ON_THE_WAY_TO_OUTLET;
    case PickupStatus.RECEIVED_BY_OUTLET:
      return OrderStatus.ARRIVED_AT_OUTLET;
    case DeliveryStatus.WAITING_FOR_DELIVERY_DRIVER:
      return OrderStatus.WAITING_FOR_DELIVERY_DRIVER;
    case DeliveryStatus.ON_THE_WAY_TO_OUTLET:
      return OrderStatus.ON_THE_WAY_TO_OUTLET;
    case DeliveryStatus.ON_THE_WAY_TO_CUSTOMER:
      return OrderStatus.BEING_DELIVERED_TO_CUSTOMER;
    case DeliveryStatus.RECEIVED_BY_CUSTOMER:
      return OrderStatus.RECEIVED_BY_CUSTOMER;
    default:
      throw new Error("Status tidak valid");
  }
};

export const updateRequestStatusService = async (data: UpdateRequestStatusData) => {
  try {
    const { driverId, requestId, type } = data;

    const isProcessingPickup = await prisma.pickupOrder.findFirst({
      where: {
        driverId,
        id: { not: requestId },
        pickupStatus: {
          in: [PickupStatus.ON_THE_WAY_TO_CUSTOMER, PickupStatus.ON_THE_WAY_TO_OUTLET],
        },
      },
    });

    const isProcessingDelivery = await prisma.deliveryOrder.findFirst({
      where: {
        driverId,
        id: { not: requestId },
        deliveryStatus: {
          in: [DeliveryStatus.ON_THE_WAY_TO_OUTLET, DeliveryStatus.ON_THE_WAY_TO_CUSTOMER],
        },
      },
    });

    if (isProcessingPickup || isProcessingDelivery) {
      throw new Error("Driver still processing other order");
    }

    let request;
    if (type === "pickup") {
      request = await prisma.pickupOrder.findUnique({
        where: { id: requestId },
      });
    } else if (type === "delivery") {
      request = await prisma.deliveryOrder.findUnique({
        where: { id: requestId },
      });
    } else {
      throw new Error("invalid request type");
    }

    if (!request) {
      throw new Error("Request not found");
    }

    let nextStatus: PickupStatus | DeliveryStatus;
    if (type === "pickup" && "pickupStatus" in request) {
      switch (request.pickupStatus) {
        case PickupStatus.WAITING_FOR_DRIVER:
          nextStatus = PickupStatus.ON_THE_WAY_TO_CUSTOMER;
          break;
        case PickupStatus.ON_THE_WAY_TO_CUSTOMER:
          nextStatus = PickupStatus.ON_THE_WAY_TO_OUTLET;
          break;
        case PickupStatus.ON_THE_WAY_TO_OUTLET:
          nextStatus = PickupStatus.RECEIVED_BY_OUTLET;
          break;
        case PickupStatus.RECEIVED_BY_OUTLET:
          throw new Error("Pickup request finished");
        default:
          throw new Error("invalid pickup request status");
      }
    } else if (type === "delivery" && "deliveryStatus" in request) {
      switch (request.deliveryStatus) {
        case DeliveryStatus.WAITING_FOR_DELIVERY_DRIVER:
          nextStatus = DeliveryStatus.ON_THE_WAY_TO_OUTLET;
          break;
        case DeliveryStatus.ON_THE_WAY_TO_OUTLET:
          nextStatus = DeliveryStatus.ON_THE_WAY_TO_CUSTOMER;
          break;
        case DeliveryStatus.ON_THE_WAY_TO_CUSTOMER:
          nextStatus = DeliveryStatus.RECEIVED_BY_CUSTOMER;
          break;
        case DeliveryStatus.RECEIVED_BY_CUSTOMER:
          throw new Error("Delivery request finished");
        default:
          throw new Error("invalid delivery request status");
      }
    } else {
      throw new Error("invalid request type");
    }

    const driver = await prisma.employee.findUnique({
      where: { userId: driverId },
      select: { outletId: true, id: true },
    });

    if (!driver || !driver.outletId) {
      throw new Error("Driver have no access to this outlet");
    }

    let updatedRequest;
    if (type === "pickup" && "pickupStatus" in request) {
      updatedRequest = await prisma.pickupOrder.update({
        where: { id: requestId },
        data: {
          pickupStatus: nextStatus as PickupStatus,
          driverId: driver.id,
        },
        include: {
          address: true,
          user: true,
        },
      });

      await prisma.order.update({
        where: { pickupOrderId: requestId },
        data: {
          orderStatus: mapToOrderStatus(nextStatus),
        },
      });
    } else if (type === "delivery" && "deliveryStatus" in request) {
      updatedRequest = await prisma.deliveryOrder.update({
        where: { id: requestId },
        data: {
          deliveryStatus: nextStatus as DeliveryStatus,
          driverId: driver.id,
        },
        include: {
          address: true,
          user: true,
        },
      });

      await prisma.order.update({
        where: { id: updatedRequest.orderId },
        data: {
          orderStatus: mapToOrderStatus(nextStatus),
        },
      });
    }
    if (type === "pickup" && nextStatus === PickupStatus.RECEIVED_BY_OUTLET) {
      const nextStation = "WASHING";
      await createNotificationForNextStation(requestId, nextStation);
    }
    return updatedRequest;
  } catch (err) {
    throw err;
  }
};
