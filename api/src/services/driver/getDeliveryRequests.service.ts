
import { Prisma } from "../../../prisma/generated/client";
import haversineDistance from "../../helpers/haversine";
import prisma from "../../prisma";

interface getDeliveryData {
  driverId: number;
  sortBy?: "createdAt" | "distance";
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export const getDeliveryRequestsService = async (query: getDeliveryData) => {
  try {
    const { driverId, sortBy, order = "asc", page = 1, pageSize = 3 } = query;

    const driver = await prisma.employee.findUnique({
      where: { userId: driverId },
      select: { outletId: true, id: true },
    });

    if (!driver || !driver.outletId) {
      throw new Error("Outlet not found");
    }

    const pickup = await prisma.order.findMany({
      where: { pickupOrderId: driver.outletId },
    });

    const outletId = driver.outletId;
    const whereClause: Prisma.DeliveryOrderWhereInput = {
      AND: [
        {
          OR: [
            { deliveryStatus: "WAITING_FOR_DRIVER", driverId: null },
            { deliveryStatus: "ON_THE_WAY_TO_OUTLET", driverId: driver.id },
            { deliveryStatus: "ON_THE_WAY_TO_CUSTOMER", driverId: driver.id },
          ],
        },
        {
          NOT: { deliveryStatus: "RECEIVED_BY_CUSTOMER" },
        },
        {
          order: {
            pickupOrder: {
              outletId: outletId,
            },
          },
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

    const deliveryRequests = await prisma.deliveryOrder.findMany({
      where: whereClause,
      include: {
        address: true,
        user: true,
      },
    });

    const deliveryRequestsWithDistance = deliveryRequests.map((request) => {
      if (!request.address) {
        throw new Error("Delivery request doesn't have an address");
      }

      const deliveryLat = request.address.latitude || 0;
      const deliveryLon = request.address.longitude || 0;
      const distance = haversineDistance(
        outletLat,
        outletLon,
        deliveryLat,
        deliveryLon
      );
      return { ...request, distance, deliveryPrice:2500 };
    });

    if (sortBy === "distance") {
      deliveryRequestsWithDistance.sort((a, b) => {
        return order === "asc"
          ? a.distance - b.distance
          : b.distance - a.distance;
      });
    } else if (sortBy === "createdAt") {
      deliveryRequestsWithDistance.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return order === "asc" ? dateA - dateB : dateB - dateA;
      });
    } else {
      deliveryRequestsWithDistance.sort((a, b) => {
        const dateA = new Date(a.updatedAt).getTime();
        const dateB = new Date(b.updatedAt).getTime();
        return order === "asc" ? dateA - dateB : dateB - dateA;
      });
    }

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedRequests = deliveryRequestsWithDistance.slice(
      startIndex,
      endIndex
    );

    return {
      data: paginatedRequests,
      pagination: {
        total: deliveryRequestsWithDistance.length,
        page: page,
        pageSize: pageSize,
        totalPages: Math.ceil(deliveryRequestsWithDistance.length / pageSize),
      },
    };
  } catch (err) {
    throw err;
  }
};
