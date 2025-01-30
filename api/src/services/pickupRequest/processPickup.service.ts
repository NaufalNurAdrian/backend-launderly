import prisma from "../../prisma";

enum PickupStatus {
  WAITING_FOR_DRIVER = "WAITING_FOR_DRIVER",
  ON_THE_WAY_TO_CUSTOMER = "ON_THE_WAY_TO_CUSTOMER",
  ON_THE_WAY_TO_OUTLET = "ON_THE_WAY_TO_OUTLET",
  RECEIVED_BY_OUTLET = "RECEIVED_BY_OUTLET",
}

interface UpdatePickupStatusData {
    driverId: number;
    pickupOrderId: number;
}

export const updatePickupStatusService = async (data: UpdatePickupStatusData) => {
    const { driverId, pickupOrderId } = data;

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
                attendanceStatus: "ACTIVE"
            },
        });

        if (!activeAttendance) {
            throw new Error("Driver belum check-in atau sudah check-out");
        }

        const pickupOrder = await prisma.pickupOrder.findUnique({
            where: { id: pickupOrderId },
        });

        if (!pickupOrder) {
            throw new Error("Pickup order not found");
        }

        const driver = await prisma.employee.findUnique({
            where: { userId: driverId },
            select: { outletId: true, id: true },
        });

        if (!driver || !driver.outletId || driver.outletId !== pickupOrder.outletId) {
            throw new Error("Driver tidak memiliki akses ke pickup order ini");
        }

        let nextStatus: PickupStatus;
        switch (pickupOrder.pickupStatus) {
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
                throw new Error("Pickup order sudah selesai");
            default:
                throw new Error("Status pickup order tidak valid");
        }

        const updatedPickupOrder = await prisma.pickupOrder.update({
            where: { id: pickupOrderId },
            data: {
                pickupStatus: nextStatus,
                driverId: driver.id, 
            },
            include: {
                address: true, 
                user: true, 
            },
        });

        return updatedPickupOrder;
    } catch (err) {
        throw err;
    }
};