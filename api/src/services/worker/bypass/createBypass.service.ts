import prisma from "../../../prisma";

interface bypassData {
  bypassNote: string;
  workerId: number;
  orderId: number;
}

export const createBypass = async (query: bypassData) => {
  const { bypassNote, workerId, orderId } = query;
  try {
    const worker = await prisma.employee.findUnique({
      where: { userId: workerId },
    });

    if (!worker) {
      throw new Error("Worker not found");
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    const orderWorker = await prisma.orderWorker.findFirst({
      where: {
        orderId: orderId,
        workerId: worker.id,
      },
    });

    if (!orderWorker) {
      throw new Error("OrderWorker not found for the given order and worker");
    }

    const requestedBypass = await prisma.orderWorker.update({
      where: { id: orderWorker.id },
      data: {
        bypassRequest: true,
        bypassNote: bypassNote,
      },
    });

    return requestedBypass;
  } catch (error) {
    console.error("Error creating OrderWorker:", error);
    throw error;
  }
};
