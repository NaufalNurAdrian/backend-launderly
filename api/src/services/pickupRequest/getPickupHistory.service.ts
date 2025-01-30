import haversineDistance from "../../helpers/haversine";
import prisma from "../../prisma";

interface getPickupData {
  driverId: number;
  sortBy?: "createdAt" | "location";
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export const getPickupHistoryService = async (query: getPickupData) => {
  try {
    const { driverId, sortBy, order, page = 1, pageSize = 15 } = query;
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
      throw new Error("Driver tidak terdaftar di outlet manapun");
    }

    const outlet = await prisma.outlet.findUnique({
      where: { id: driver.outletId },
      include: {
        address: true,
      },
    });

    if (!outlet || !outlet.address || outlet.address.length === 0) {
      throw new Error("Outlet tidak memiliki alamat utama");
    }

    const outletAddress = outlet.address[0];
    const outletLat = parseFloat(outletAddress.latitude || "0");
    const outletLon = parseFloat(outletAddress.longitude || "0");

    const pickupHistory = await prisma.pickupOrder.findMany({
      where: {
        outletId: driver.outletId,
        pickupStatus: "RECEIVED_BY_OUTLET",
        driverId: driver.id,
      },
      include: {
        address: true,
        user: true,
      },
    });

    const pickupHistoryWithDistance = pickupHistory.map((request) => {
      if (!request.address) {
        throw new Error("Pickup request tidak memiliki alamat");
      }

      const pickupLat = parseFloat(request.address.latitude || "0");
      const pickupLon = parseFloat(request.address.longitude || "0");

      const distance = haversineDistance(outletLat, outletLon, pickupLat, pickupLon);
      return { ...request, distance };
    });

    if (sortBy === "location") {
      pickupHistoryWithDistance.sort((a, b) => {
        return order === "asc" ? a.distance - b.distance : b.distance - a.distance;
      });
    } else if (sortBy === "createdAt") {
      pickupHistoryWithDistance.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return order === "asc" ? dateA - dateB : dateB - dateA;
      });
    }

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedHistory = pickupHistoryWithDistance.slice(startIndex, endIndex);

    return {
      data: paginatedHistory,
      pagination: {
        total: pickupHistoryWithDistance.length,
        page: page,
        pageSize: pageSize,
        totalPages: Math.ceil(pickupHistoryWithDistance.length / pageSize),
      },
    };
  } catch (err) {
    throw err;
  }
};
