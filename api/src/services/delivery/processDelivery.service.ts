import prisma from "../../prisma";

enum deliveryStatus {
  WAITING_FOR_DRIVER = "WAITING_FOR_DRIVER",
  ON_THE_WAY_TO_OUTLET = "ON_THE_WAY_TO_OUTLET",
  ON_THE_WAY_TO_CUSTOMER = "ON_THE_WAY_TO_CUSTOMER",
  RECEIVED_BY_CUSTOMER = "RECEIVED_BY_CUSTOMER",
}

interface UpdateDeliveryStatusData {
  driverId: number;
  deliveryOrderId: number;
}

export const updateDeliveryStatusService = async (data: UpdateDeliveryStatusData) => {
  const { driverId, deliveryOrderId } = data;

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
        attendanceStatus: "ACTIVE",
      },
    });

    if (!activeAttendance) {
      throw new Error("Driver belum check-in atau sudah check-out");
    }

    const deliveryOrder = await prisma.deliveryOrder.findUnique({
      where: { id: deliveryOrderId },
    });

    if (!deliveryOrder) {
      throw new Error("delivery order not found");
    }

    const driver = await prisma.employee.findUnique({
      where: { userId: driverId },
      select: { outletId: true, id: true },
    });

    if (!driver || !driver.outletId ) {
      throw new Error("Driver tidak memiliki akses ke delivery order ini");
    }

    let nextStatus: deliveryStatus;
    switch (deliveryOrder.deliveryStatus) {
      case deliveryStatus.WAITING_FOR_DRIVER:
        nextStatus = deliveryStatus.ON_THE_WAY_TO_CUSTOMER;
        break;
      case deliveryStatus.ON_THE_WAY_TO_OUTLET:
        nextStatus = deliveryStatus.RECEIVED_BY_CUSTOMER;
        break;
      case deliveryStatus.ON_THE_WAY_TO_CUSTOMER:
        nextStatus = deliveryStatus.ON_THE_WAY_TO_OUTLET;
        break;
      case deliveryStatus.RECEIVED_BY_CUSTOMER:
        throw new Error("delivery order sudah selesai");
      default:
        throw new Error("Status delivery order tidak valid");
    }

    const updateddeliveryOrder = await prisma.deliveryOrder.update({
      where: { id: deliveryOrderId },
      data: {
        deliveryStatus: nextStatus,
        driverId: driver.id,
      },
      include: {
        address: true,
        user: true,
      },
    });

    return updateddeliveryOrder;
  } catch (err) {
    throw err;
  }
};
