import haversineDistance from "../../helpers/haversine";
import prisma from "../../prisma";

interface getDeliveryData {
  driverId: number;
  sortBy?: "createdAt" | "location";
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}
export const getDeliveryHistoryService = async (query: getDeliveryData) => {
  try {
    const { driverId, sortBy, order = "asc", page = 1, pageSize = 4 } = query;
    const user = await prisma.user.findUnique({
      where: { id: driverId },
      select: { role: true },
    });

    if (!user || user.role !== "DRIVER") {
      throw new Error("Hanya driver yang dapat mengakses data ini");
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
      include: { address: true },
    });

    if (!outlet || !outlet.address || outlet.address.length === 0) {
      throw new Error("Primary adress not found");
    }

    const outletAddress = outlet.address[0];
    const outletLat = parseFloat(outletAddress.latitude || "0");
    const outletLon = parseFloat(outletAddress.longitude || "0");

    const deliveryHistory = await prisma.deliveryOrder.findMany({
      where: {
        deliveryStatus: "RECEIVED_BY_CUSTOMER",
        driverId: driver.id
      },
      include: {
        address: true,
        user: true,
      },
    });

    const deliveryHistoryWithDistance = deliveryHistory.map((request) => {
      if (!request.address) {
        throw new Error("Delivery request doesn't have address");
      }

      const deliveryLat = parseFloat(request.address.latitude || "0");
      const deliveryLon = parseFloat(request.address.longitude || "0");

      const distance = haversineDistance(outletLat, outletLon, deliveryLat, deliveryLon);
      return { ...request, distance };
    });

    if (sortBy === "location") {
      deliveryHistoryWithDistance.sort((a, b) => {
        return order === "asc" ? a.distance - b.distance : b.distance - a.distance;
      });
    }

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatryHistory = deliveryHistoryWithDistance.slice(startIndex, endIndex);

    return {
      data: paginatryHistory,
      pagination: {
        total: deliveryHistoryWithDistance.length,
        page: page,
        pageSize: pageSize,
        totalPages: Math.ceil(deliveryHistoryWithDistance.length / pageSize),
      },
    };
  } catch (err) {
    throw err;
  }
};
