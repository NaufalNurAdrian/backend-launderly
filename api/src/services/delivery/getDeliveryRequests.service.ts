import { Prisma } from "@prisma/client";
import haversineDistance from "../../helpers/haversine";
import prisma from "../../prisma";

interface getDeliveryData {
  driverId: number;
  sortBy?: "createdAt" | "location";
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export const getDeliveryRequestsService = async (query: getDeliveryData) => {
  try {
    const { driverId, sortBy, order = "asc", page = 1, pageSize = 4 } = query;
    const user = await prisma.user.findUnique({
      where: { id: driverId },
      select: { role: true },
    });

    if (!user || user.role !== "DRIVER") {
      throw new Error("Hanya driver yang dapat mengakses data ini");
    }

    const activeAttendance = await prisma.attendance.findFirst({
      where: {
        userId: driverId,
        checkOut: null,
      },
    });

    if (!activeAttendance) {
      throw new Error("Driver hasn't checked in");
    }

    const driver = await prisma.employee.findUnique({
      where: { userId: driverId },
      select: { outletId: true, id: true },
    });

    if (!driver || !driver.outletId) {
      throw new Error("Outlet not found");
    }

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
    const outletLat = parseFloat(outletAddress.latitude || "0");
    const outletLon = parseFloat(outletAddress.longitude || "0");

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
      ],
    };

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

      const deliveryLat = parseFloat(request.address.latitude || "0");
      const deliveryLon = parseFloat(request.address.longitude || "0");

      const distance = haversineDistance(outletLat, outletLon, deliveryLat, deliveryLon);
      return { ...request, distance, deliveryPrice: 20000 };
    });

    if (sortBy === "location") {
      deliveryRequestsWithDistance.sort((a, b) => {
        return order === "asc" ? a.distance - b.distance : b.distance - a.distance;
      });
    }

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedRequests = deliveryRequestsWithDistance.slice(startIndex, endIndex);

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
