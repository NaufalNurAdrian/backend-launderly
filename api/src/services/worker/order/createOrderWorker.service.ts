import prisma from "../../../prisma";

interface createOrderWorker{
    workerId: number,
    orderId: number
}

export const createOrderWorker = async (query: createOrderWorker) => {
    const {workerId, orderId} = query
  try {
    const worker = await prisma.employee.findUnique({
      where: { userId: workerId },
    });

    if (!worker) {
      throw new Error ("Worker not found" );
    }

    const station: string = worker.station as string;
    const newStatus =
    station === "WASHING" ? "BEING_WASHED" :
    station === "IRONING" ? "BEING_IRONED" :
    "BEING_PACKED";

    await prisma.order.update({
      where: { id: orderId },
      data: { orderStatus: newStatus },
    });

    const orderWorker = await prisma.orderWorker.create({
      data: {
        orderId: orderId,
        workerId: worker.id,
        station: worker.station,
        isComplete: false,
      },
    });

    return orderWorker;
  } catch (error) {
    throw error;
  }
}
