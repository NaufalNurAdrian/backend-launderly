import prisma from "../../prisma";
import { PaginationQueryParams } from "@/types/pagination.type";
import { Prisma } from "@prisma/client";
import { endOfMonth, getDaysInMonth } from "date-fns";

interface GetPaymentsQuery extends PaginationQueryParams {
  id: number;
  filterOutlet: number | string;
  filterMonth: string;
  filterYear: string;
}

export const getPaymentsService = async (query: GetPaymentsQuery) => {
  try {
    const {
      page,
      sortBy,
      sortOrder,
      take,
      id,
      filterMonth,
      filterOutlet,
      filterYear,
    } = query;

    const existingUser = await prisma.user.findFirst({
      where: { id: id },
      select: {
        employee: { select: { outlet: { select: { id: true } } } },
        role: true,
      },
    });

    if (!existingUser) {
      throw new Error("User not Found!");
    }

    const whereClause: Prisma.PaymentWhereInput = {
      paymentStatus: "SUCCESSED",
    };

    if (existingUser.role != "SUPER_ADMIN") {
      const pickupOrders = await prisma.pickupOrder.findMany({
        where: { outletId: existingUser.employee?.outlet?.id },
        select: { id: true },
      });

      const pickupOrderIds = pickupOrders.map((pickup) => pickup.id);

      const orders = await prisma.order.findMany({
        where: { pickupOrderId: { in: pickupOrderIds } },
        select: { id: true },
      });

      const orderIds = orders.map((order) => order.id);

      whereClause.orderId = { in: orderIds };
    } else {
      if (filterOutlet != "all") {
        const pickupOrders = await prisma.pickupOrder.findMany({
          where: { outletId: Number(filterOutlet) },
          select: { id: true },
        });

        const pickupOrderIds = pickupOrders.map((pickup) => pickup.id);

        const orders = await prisma.order.findMany({
          where: { pickupOrderId: { in: pickupOrderIds } },
          select: { id: true },
        });

        const orderIds = orders.map((order) => order.id);

        whereClause.orderId = { in: orderIds };
      }
    }

    const now = new Date();
    const month = filterMonth ? Number(filterMonth) - 1 : now.getMonth();
    const year = filterYear ? Number(filterYear) : now.getFullYear();

    const startDate = new Date(year, month, 1);
    const endDate = endOfMonth(startDate);

    whereClause.updatedAt = {
      gte: startDate,
      lt: endDate,
    };

    const payments = await prisma.payment.findMany({
      where: whereClause,
      skip: (page - 1) * take,
      take: take,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: { order: true },
    });

    const count = await prisma.payment.count({ where: whereClause });

    return {
      data: payments,
      meta: { page, take, total: count },
    };
  } catch (error) {
    throw error;
  }
};
