import prisma from "../../prisma";
import { PaginationQueryParams } from "../../types/pagination.type";
import { PickupStatus, Prisma } from "@prisma/client";

interface GetPickupOrdersQuery extends PaginationQueryParams {
  id: number;
  pickupStatus: string;
  isOrderCreated: number;
  isClaimedbyDriver: number;
}

export const getPickupOrdersService = async (query: GetPickupOrdersQuery) => {
  try {
    const {
      page = 1,
      sortBy = "createdAt",
      sortOrder = "desc",
      pickupStatus,
      isOrderCreated,
      take = 10,
      id,
      isClaimedbyDriver,
    } = query;

    const existingUser = await prisma.user.findFirst({
      where: { id: id },
      select: { role: true },
    });

    if (!existingUser) {
      throw new Error("User not found!");
    }

    if (existingUser.role !== "CUSTOMER") {
      throw new Error("Unauthorized access!");
    }

    const whereClause: Prisma.PickupOrderWhereInput = {};

    if (pickupStatus !== "all") {
      whereClause.pickupStatus = pickupStatus as PickupStatus;
    }

    if (!Number.isNaN(isOrderCreated)) {
      whereClause.isOrderCreated = Boolean(isOrderCreated);
    }

    if (Boolean(isClaimedbyDriver)) {
      whereClause.driverId = { not: null };
    }

    const pickupOrders = await prisma.pickupOrder.findMany({
      where: whereClause,
      include: {
        address: true,
        user: true,
        outlet: true,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * take,
      take,
    });

    const count = await prisma.pickupOrder.count({ where: whereClause });

    return {
      data: pickupOrders,
      meta: { page, take, total: count },
    };
  } catch (error) {
    throw error;
  }
};
