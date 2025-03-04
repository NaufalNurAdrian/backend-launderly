import { OrderStatus, Prisma } from "@prisma/client";
import prisma from "../../../prisma";

interface GetWorkerOrdersData {
  workerId: number;
  sortBy?: "createdAt";
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export const getWorkerOrdersHistoryService = async (
  query: GetWorkerOrdersData
) => {
  try {
    const { workerId, order, page = 1, pageSize = 4 } = query;

    const worker = await prisma.user.findUnique({
      where: { id: workerId, role: "WORKER" },
    });

    if (!worker) {
      throw new Error("Hanya worker yang dapat mengakses data ini");
    }

    const workerStation = await prisma.employee.findFirst({
      where: {
        userId: workerId,
      },
    });

    if (!workerStation) {
      throw new Error("Worker tidak memiliki station yang ditetapkan");
    }

    const station = workerStation.station;

    const whereClause: Prisma.OrderWhereInput = {
      AND: [
        {
          OR: [
            { orderStatus: OrderStatus.WASHING_COMPLETED },
            { orderStatus: OrderStatus.IRONING_COMPLETED },
            { orderStatus: OrderStatus.AWAITING_PAYMENT },
          ],
        },
        {
          orderWorker: {
            some: {
              workerId: workerStation.id,
            },
          },
        },
      ],
    };

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        orderItem: true,
        orderWorker: true,
      },
      orderBy: {
        createdAt: order || "asc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const totalOrders = await prisma.order.count({
      where: whereClause,
    });

    return {
      station: station,
      data: orders,
      pagination: {
        total: totalOrders,
        page: page,
        pageSize: pageSize,
        totalPages: Math.ceil(totalOrders / pageSize),
      },
    };
  } catch (err) {
    throw err;
  }
};
