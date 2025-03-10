import { OrderStatus, Prisma } from "../../../../prisma/generated/client";
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
      throw new Error("only worker can access this data");
    }

    const workerStation = await prisma.employee.findFirst({
      where: {
        userId: workerId,
      },
    });

    if (!workerStation) {
      throw new Error("worker station undefined");
    }

    const station = workerStation.station;
 
    const whereClause: Prisma.OrderWhereInput = {
      orderWorker: {
        some: {
          workerId: workerStation.id,
          isComplete: true
        },
      },
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