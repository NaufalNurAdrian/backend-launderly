import haversineDistance from "../../../helpers/haversine";
import prisma from "../../../prisma";

interface getHistoryData {
  driverId: number;
  type?: "pickup" | "delivery"; 
  sortBy?: "createdAt" | "distance";
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export const getDriverHistoryService = async (query: getHistoryData) => {
  try {
    const { driverId, type, sortBy, order, page = 1, pageSize = 15 } = query;
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
    const outletLat = outletAddress.latitude || 0;
    const outletLon = outletAddress.longitude || 0;

    const pickupHistory =
      !type || type === "pickup"
        ? await prisma.pickupOrder.findMany({
            where: {
              outletId: driver.outletId,
              pickupStatus: "RECEIVED_BY_OUTLET", 
              driverId: driver.id,
            },
            include: {
              address: true,
              user: true,
            },
          })
        : [];

    const deliveryHistory =
      !type || type === "delivery"
        ? await prisma.deliveryOrder.findMany({
            where: {
              deliveryStatus: "RECEIVED_BY_CUSTOMER", 
              driverId: driver.id,
            },
            include: {
              address: true,
              user: true,
              order: true,
            },
          })
        : [];

    const allHistory = [
      ...pickupHistory.map((request) => ({
        ...request,
        type: "pickup",
      })),
      ...deliveryHistory.map((request) => ({
        ...request,
        type: "delivery",
      })),
    ];

    const historyWithDistance = allHistory.map((request) => {
      if (!request.address) {
        throw new Error("Request tidak memiliki alamat");
      }

      const requestLat = request.address.latitude || 0;
      const requestLon = request.address.longitude || 0;

      const distance = haversineDistance(outletLat, outletLon, requestLat, requestLon);
      return { ...request, distance };
    });

    if (sortBy === "distance") {
      historyWithDistance.sort((a, b) => {
        return order === "asc" ? a.distance - b.distance : b.distance - a.distance;
      });
    } else if (sortBy === "createdAt") {
      historyWithDistance.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return order === "asc" ? dateA - dateB : dateB - dateA;
      });
    }

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedHistory = historyWithDistance.slice(startIndex, endIndex);

    return {
      data: paginatedHistory,
      pagination: {
        total: historyWithDistance.length,
        page: page,
        pageSize: pageSize,
        totalPages: Math.ceil(historyWithDistance.length / pageSize),
      },
    };
  } catch (err) {
    throw err;
  }
};