import prisma from "../../../prisma";

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

interface UpdateRequestStatusData {
  driverId: number;
  requestId: number;
  type: "pickup" | "delivery";
}

export const updateRequestStatusService = async (data: UpdateRequestStatusData) => {
  const { driverId, requestId, type } = data;

  try {
    const user = await prisma.user.findUnique({
      where: { id: driverId },
      select: { role: true },
    });

    if (!user || user.role !== "DRIVER") {
      throw new Error("Hanya driver yang dapat mengakses data ini");
    }

    const activeAttendance = await prisma.attendance.findFirst({
      where: {
        userId: driverId,
        checkOut: null,
      },
    });

    if (!activeAttendance) {
      throw new Error("Driver belum check-in atau sudah check-out");
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
      throw new Error("Tipe request tidak valid");
    }

    if (!request) {
      throw new Error("Request tidak ditemukan");
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
          throw new Error("Pickup request sudah selesai");
        default:
          throw new Error("Status pickup request tidak valid");
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
          throw new Error("Delivery request sudah selesai");
        default:
          throw new Error("Status delivery request tidak valid");
      }
    } else {
      throw new Error("Tipe request tidak valid");
    }

    const driver = await prisma.employee.findUnique({
      where: { userId: driverId },
      select: { outletId: true, id: true },
    });

    if (!driver || !driver.outletId) {
      throw new Error("Driver tidak memiliki akses ke delivery order ini");
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
    } else if (type === "delivery" && "deliveryStatus" in request) {
      updatedRequest = await prisma.deliveryOrder.update({
        where: { id: requestId },
        data: {
          deliveryStatus: nextStatus as DeliveryStatus,
          driverId: driverId,
        },
        include: {
          address: true,
          user: true,
        },
      });
    }

    return updatedRequest;
  } catch (err) {
    throw err;
  }
};
