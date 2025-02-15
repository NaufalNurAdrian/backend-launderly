import prisma from "@/prisma";
import { PaginationQueryParams } from "@/types/pagination.type";
import { PickupStatus, Prisma } from "@prisma/client";

interface GetPickupOrdersQuery extends PaginationQueryParams {
  id: number;
  pickupStatus: string;
  isOrderCreated: number;
  isClaimedbyDriver: number;
  latitude: number;
  longitude: number;
}

export const getPickupOrdersService = async (query: GetPickupOrdersQuery) => {
  try {
    const { page, sortBy, sortOrder, pickupStatus, isOrderCreated, take, id, isClaimedbyDriver, latitude, longitude } = query;

    const existingUser = await prisma.user.findFirst({
      where: { id: id },
      select: { employee: true, role: true }
    })

    const whereClause: Prisma.PickupOrderWhereInput = {}

    if (pickupStatus != 'all') {
      whereClause.pickupStatus = pickupStatus as PickupStatus;
    }

    if (existingUser?.role == "DRIVER") {
      whereClause.outletId = existingUser.employee?.outletId;
      if (pickupStatus != String(PickupStatus.WAITING_FOR_DRIVER)) {
        whereClause.driverId = existingUser.employee?.id;
      }
      if (latitude != 0 && longitude != 0) {

        const pickupOrders = await prisma.pickupOrder.findMany({
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

        const R = 6371;

        const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
          const dLat = (lat2 - lat1) * Math.PI / 180.0;
          const dLon = (lon2 - lon1) * Math.PI / 180.0;
          const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180.0) * Math.cos(lat2 * Math.PI / 180.0) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return R * c;
        };

        const sortedPickupOrders = pickupOrders.map(order => {
          const address = order.address
          const realDistance = address && address.latitude && address.longitude
            ? haversineDistance(latitude, longitude, parseFloat(address.latitude), parseFloat(address.longitude))
            : Infinity;
          return { ...order, realDistance};
        }).sort((a, b) => a.realDistance - b.realDistance);

        const paginatedOrders = sortedPickupOrders.slice((page - 1) * take, page * take);

        const count = sortedPickupOrders.length;

        return {
          data: paginatedOrders,
          meta: { page, take, total: count }
        };
      }
    } 
    if (existingUser?.role == "OUTLET_ADMIN") {
      whereClause.outletId = existingUser?.employee?.outletId;
    }

    if (!Number.isNaN(isOrderCreated)) {
      whereClause.isOrderCreated = Boolean(isOrderCreated)
    }

    if (Boolean(isClaimedbyDriver) == true) {
      whereClause.driverId = {
        not: null,
      }
    }

    const pickupOrders = await prisma.pickupOrder.findMany({
      where: whereClause,
      skip: (page - 1) * take,
      take: take,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        user: true,
        outlet: true,
        driver: {
          include: {
            user: true,
          },
        },
      },
    });

    const count = await prisma.pickupOrder.count({ where: whereClause });

    return {
      data: pickupOrders,
      meta: { page, take, total: count }
    };

  } catch (error) {
    throw error
  }
}