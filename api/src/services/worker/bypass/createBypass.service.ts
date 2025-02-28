import prisma from "../../../prisma";

interface BypassData {
  bypassNote: string;
  orderId: number;
  workerId: number;
}

export const createBypass = async (query: BypassData) => {
  const { bypassNote, orderId, workerId } = query;

  try {
    const worker = await prisma.employee.findUnique({
      where: { userId: workerId },
      include: {
        outlet: true,
        user: {
          select: { fullName: true },
        },
      },
    });

    if (!worker) throw new Error("Worker not found");

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new Error("Order not found");

    const orderWorker = await prisma.orderWorker.findFirst({
      where: {
        orderId: orderId,
        workerId: worker.id,
      },
    });

    if (!orderWorker) throw new Error("OrderWorker not found for the given order and worker");

    const requestedBypass = await prisma.orderWorker.update({
      where: { id: orderWorker.id },
      data: {
        bypassRequest: true,
        bypassNote: bypassNote,
      },
    });

    const notification = await prisma.notification.create({
      data: {
        title: "New Bypass Request",
        description: `New bypass request from ${worker.user.fullName}.`,
      },
    });

    const outletAdmins = await prisma.user.findMany({
      where: {
        role: "OUTLET_ADMIN",
        employee: {
          outletId: worker.outletId,
        },
      },
    });

    await Promise.all(
      outletAdmins.map(async (user) => {
        await prisma.userNotification.create({
          data: {
            userId: user.id,
            notificationId: notification.id,
          },
        });
      })
    );

    return requestedBypass;
  } catch (error) {
    console.error("Error creating OrderWorker:", error);
    throw error;
  }
};
