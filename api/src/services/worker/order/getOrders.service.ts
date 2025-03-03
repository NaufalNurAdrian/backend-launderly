import { OrderStatus, Prisma } from "@prisma/client";
import prisma from "../../../prisma";

interface GetWorkerOrdersData {
  workerId: number;
  sortBy?: "createdAt" | "weight";
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export const getWorkerOrdersService = async (query: GetWorkerOrdersData) => {
  try {
    const { workerId, order, page = 1, pageSize = 4, sortBy } = query;

    const worker = await prisma.user.findUnique({
      where: { id: workerId, role: "WORKER" },
    });

    if (!worker) {
      throw new Error("unauthorized, are you a worker ?");
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
      throw new Error("you haven't check in or you're already checked out");
    }

    const workerStation = await prisma.employee.findFirst({
      where: {
        userId: workerId,
      },
    });
    if (!workerStation) {
      throw new Error("Worker Station undefied");
    }

    const station = workerStation.station;
    const orderStatus: OrderStatus = station === "WASHING" ? OrderStatus.READY_FOR_WASHING : station === "IRONING" ? OrderStatus.WASHING_COMPLETED : OrderStatus.IRONING_COMPLETED;

    const whereClause: Prisma.OrderWhereInput = {
      AND: [
        {
<<<<<<< HEAD
          OR: [
            {
              orderStatus: orderStatus,
=======
<<<<<<< HEAD
          OR: [
            {
              orderStatus: orderStatus,
=======
          orderStatus: orderStatus,
        },
        {
          orderStatus: station === "WASHING" ? OrderStatus.BEING_WASHED : station === "IRONING" ? OrderStatus.BEING_IRONED : OrderStatus.BEING_PACKED,
          orderWorker: {
            some: {
              workerId: workerStation.id,
>>>>>>> 6c7961c117a36183acead19e5590fafa7249e7d3
>>>>>>> 39f13b9ad2459764a638079a7b6a81a76501631a
            },
            {
              orderStatus: station === "WASHING" ? OrderStatus.BEING_WASHED : station === "IRONING" ? OrderStatus.BEING_IRONED : OrderStatus.BEING_PACKED,
              orderWorker: {
                some: {
                  workerId: workerStation.id,
                },
              },
            },
          ],
        },
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 39f13b9ad2459764a638079a7b6a81a76501631a
          {
            OR: [
              {
                orderWorker: {
                  some: {
                    bypassAccepted: true,
                    bypassRequest: false, 
                    station: station, 
                  },
                },
              },
              {
                orderWorker: {
                  some: {
                    bypassRejected: true,
                    station: station,
                  },
                },
              },
              {
                orderWorker: {
                  none: {
                    bypassRequest: true,
                    bypassAccepted: false, 
                    station: station,
                  },
                },
              },
            ],
          },
        ],
<<<<<<< HEAD
=======
=======
      ],
      AND: [
        {
          orderWorker: {
            none: {
              bypassRequest: true,
              bypassRejected: false,
              bypassAccepted: true, 
            },
          },
        },
      ],
>>>>>>> 6c7961c117a36183acead19e5590fafa7249e7d3
>>>>>>> 39f13b9ad2459764a638079a7b6a81a76501631a
    };

    const orderByClause: Prisma.OrderOrderByWithRelationInput = {};
    if (sortBy === "weight") {
      orderByClause.weight = order;
    } else {
      orderByClause.createdAt = order;
    }
    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        orderItem: true,
        orderWorker: true,
        pickupOrder: {
          include: {
            user: true,
          },
        },
      },
      orderBy: orderByClause,
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
