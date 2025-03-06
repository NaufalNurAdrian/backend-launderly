import { Prisma } from "@prisma/client";
import haversineDistance from "../../helpers/haversine";
import prisma from "../../prisma";

interface getPickupData {
  driverId: number;
  sortBy?: "createdAt" | "distance" | "updatedAt";
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export const getPickupRequestsService = async (query: getPickupData) => {
  try {
    const { driverId, sortBy = "updatedAt", order = "desc", page = 1, pageSize = 3 } = query;

    const driver = await prisma.employee.findUnique({
      where: { userId: driverId },
      select: { outletId: true, id: true },
    });

    if (!driver || !driver.outletId) {
      throw new Error("Outlet not found");
    }

    const outletId = driver.outletId;
    const whereClause: Prisma.PickupOrderWhereInput = {
      AND: [
        {
          OR: [
            { pickupStatus: "WAITING_FOR_DRIVER", driverId: null },
            { pickupStatus: "ON_THE_WAY_TO_CUSTOMER", driverId: driver.id },
            { pickupStatus: "ON_THE_WAY_TO_OUTLET", driverId: driver.id },
          ],
        },
        {
          NOT: { pickupStatus: "RECEIVED_BY_OUTLET" },
        },
        {
          outletId: outletId,
        },
      ],
    };

    const outlet = await prisma.outlet.findUnique({
      where: { id: driver.outletId },
      include: {
        address: true,
      },
    });

    if (!outlet || !outlet.address || outlet.address.length === 0) {
      throw new Error("Primary address not found");
    }

    const outletAddress = outlet.address[0];
    const outletLat = outletAddress.latitude || 0;
    const outletLon = outletAddress.longitude || 0;

    const pickupRequests = await prisma.pickupOrder.findMany({
      where: whereClause,
      include: {
        address: true,
        user: true,
      },
    });

    const pickupRequestsWithDistance = pickupRequests.map((request) => {
      if (!request.address) {
        throw new Error("Pickup request doesn't have address");
      }

      const pickupLat = request.address.latitude || 0;
      const pickupLon = request.address.longitude || 0;

      const distance = haversineDistance(outletLat, outletLon, pickupLat, pickupLon);
      return { ...request, distance };
    });

    if (sortBy === "distance") {
      pickupRequestsWithDistance.sort((a, b) => {
        return order === "asc" ? a.distance - b.distance : b.distance - a.distance;
      });
    } else if (sortBy === "createdAt") {
      pickupRequestsWithDistance.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return order === "asc" ? dateA - dateB : dateB - dateA;
      });
    } else {
      pickupRequestsWithDistance.sort((a, b) => {
        const dateA = new Date(a.updatedAt).getTime();
        const dateB = new Date(b.updatedAt).getTime();
        return order === "asc" ? dateA - dateB : dateB - dateA;
      });
    }

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedRequests = pickupRequestsWithDistance.slice(startIndex, endIndex);

    return {
      data: paginatedRequests,
      pagination: {
        total: pickupRequestsWithDistance.length,
        page: page,
        pageSize: pageSize,
        totalPages: Math.ceil(pickupRequestsWithDistance.length / pageSize),
      },
    };
  } catch (err) {
    throw err;
  }
};
