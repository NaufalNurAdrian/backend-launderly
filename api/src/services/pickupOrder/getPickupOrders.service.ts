import prisma from "../../prisma";
import { PaginationQueryParams } from "../../types/pagination.type";
import { PickupStatus, Prisma } from "@prisma/client";

interface GetPickupOrdersQuery extends PaginationQueryParams {
  id: number;
  pickupStatus: string;
  isOrderCreated: number;
  isClaimedbyDriver: number;
  latitude?: number;
  longitude?: number;
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
      latitude,
      longitude,
    } = query;

    const existingUser = await prisma.user.findFirst({
      where: { id: id },
      select: { employee: true, role: true },
    });

    if (!existingUser) {
      throw new Error("User not found!");
    }

    const whereClause: Prisma.PickupOrderWhereInput = {};

    if (pickupStatus !== "all") {
      whereClause.pickupStatus = pickupStatus as PickupStatus;
    }

    if (existingUser.role === "DRIVER") {
      whereClause.outletId = existingUser.employee?.outletId;
      if (pickupStatus !== String(PickupStatus.WAITING_FOR_DRIVER)) {
        whereClause.driverId = existingUser.employee?.id;
      }
    } else if (existingUser.role === "OUTLET_ADMIN") {
      whereClause.outletId = existingUser.employee?.outletId;
    }

    if (!Number.isNaN(isOrderCreated)) {
      whereClause.isOrderCreated = Boolean(isOrderCreated);
    }

    if (Boolean(isClaimedbyDriver)) {
      whereClause.driverId = { not: null };
    }

    let pickupOrders = await prisma.pickupOrder.findMany({
      where: whereClause,
      include: {
        address: true,
        user: true,
        outlet: true,
        driver: {
          include: {
            user: true,
          },
        },
      },
    });

    if (
      existingUser.role === "DRIVER" &&
      latitude !== undefined &&
      longitude !== undefined
    ) {
      const R = 6371;

      const haversineDistance = (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
      ) => {
        const dLat = ((lat2 - lat1) * Math.PI) / 180.0;
        const dLon = ((lon2 - lon1) * Math.PI) / 180.0;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180.0) *
            Math.cos((lat2 * Math.PI) / 180.0) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };

      pickupOrders = pickupOrders
        .map((order) => {
          const address = order.address;
          const realDistance =
            address && address.latitude !== null && address.longitude !== null
              ? haversineDistance(latitude, longitude, address.latitude, address.longitude)
              : Infinity;

          return { ...order, realDistance };
        })
        .sort((a, b) => a.realDistance - b.realDistance);
    }

    const count = pickupOrders.length;
    const paginatedOrders = pickupOrders.slice((page - 1) * take, page * take);

    return {
      data: paginatedOrders,
      meta: { page, take, total: count },
    };
  } catch (error) {
    throw error;
  }
};
