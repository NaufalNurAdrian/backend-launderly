import prisma from "../../../prisma";

interface CreateOrderWorker {
  workerId: number;
  orderId: number;
}

export const createOrderWorker = async (query: CreateOrderWorker) => {
  const { workerId, orderId } = query;

  return await prisma.$transaction(async (prisma) => {
    const pendingBypassOrder = await prisma.orderWorker.findFirst({
      where: {
        orderId,
        bypassRequest: true,
        AND: [{ bypassAccepted: false }, { bypassRejected: false }],
      },
    });

    if (pendingBypassOrder) {
      throw new Error("Order has a pending bypass request.");
    }

    const worker = await prisma.employee.findUnique({
      where: { userId: workerId },
    });

    if (!worker) {
      throw new Error("Worker not found");
    }

    const station: string = worker.station as string;
    const newStatus = station === "WASHING" ? "BEING_WASHED" : station === "IRONING" ? "BEING_IRONED" : "BEING_PACKED";

    await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: newStatus },
    });

    const orderWorker = await prisma.orderWorker.create({
      data: {
        orderId,
        workerId: worker.id,
        station: worker.station,
        isComplete: false,
      },
    });

    return orderWorker;
  });
};
