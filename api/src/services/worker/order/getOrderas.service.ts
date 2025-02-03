import { OrderStatus, Prisma } from "@prisma/client";
import prisma from "../../../prisma";

interface GetWorkerOrdersData {
  workerId: number;
  sortBy?: "createdAt";
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
  station: "WASHING" | "IRONING" | "PACKING";
}

export const getWorkerOrdersService = async (query: GetWorkerOrdersData) => {
  try {
    const { workerId, order, sortBy, page = 1, pageSize = 4, station } = query;

    const worker = await prisma.user.findUnique({
      where: { id: workerId, role: "WORKER" },
    });

    if (!worker) {
      throw new Error("Hanya worker yang dapat mengakses data ini");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findFirst({
      where: {
        userId: workerId,
        createdAt: {
          gte: today,
        },
        attendanceStatus: "ACTIVE",
      },
    });

    if (!attendance) {
      throw new Error("Anda belum melakukan absensi hari ini");
    }

    const workerStation = await prisma.employee.findFirst({
      where: {
        userId: workerId,
        station: station,
      },
    });
    if (!station) {
      throw new Error("Station worker tidak ditemukan");
    }
    const orderStatus: OrderStatus = 
    station === "WASHING" ? OrderStatus.READY_FOR_WASHING :
    station === "IRONING" ? OrderStatus.WASHING_COMPLETED :
    OrderStatus.IRONING_COMPLETED;

  const whereClause: Prisma.OrderWhereInput = {
    orderStatus: orderStatus, 
    orderWorker: {
      some: {
        workerId: workerId,
        isComplete: false,
        bypassRequest: false,
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
      take: pageSize,    });

      const totalOrders = await prisma.order.count({
      where: whereClause,
    });

    return {
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
