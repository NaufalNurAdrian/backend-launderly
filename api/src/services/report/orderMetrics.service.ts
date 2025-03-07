import prisma from "../../prisma";

export async function getOrderMetrics(baseWhereClause: any) {
  try {
    const ordersByStatus = await prisma.order.groupBy({
      by: ['orderStatus'],
      where: {
        pickupOrder: {
          outletId: baseWhereClause.outletId,
        },
        createdAt: baseWhereClause.createdAt,
      },
      _count: true,
    });

    const completedOrders = await prisma.order.findMany({
      where: {
        orderStatus: "COMPLETED",
        pickupOrder: {
          outletId: baseWhereClause.outletId,
        },
        createdAt: baseWhereClause.createdAt,
      },
      select: {
        createdAt: true,
        updatedAt: true,
      },
    });
    const processingTimes = completedOrders.map(order => {
      const creationTime = new Date(order.createdAt).getTime();
      const completionTime = new Date(order.updatedAt).getTime();
      return (completionTime - creationTime) / (1000 * 60 * 60); 
    });
    const avgProcessingTimeHours = processingTimes.length > 0
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
      : 0;

    const popularItems = await prisma.orderItem.groupBy({
      by: ['laundryItemId'],
      where: {
        order: {
          pickupOrder: {
            outletId: baseWhereClause.outletId,
          },
          createdAt: baseWhereClause.createdAt,
        },
        isDelete: false,
      },
      _sum: {
        qty: true,
      },
    });
    const itemDetails = await Promise.all(
      popularItems.map(async (item) => {
        const laundryItem = await prisma.laundryItem.findUnique({
          where: { id: item.laundryItemId },
          select: { itemName: true },
        });
        return {
          id: item.laundryItemId,
          name: laundryItem?.itemName || "Unknown Item",
          quantity: item._sum.qty || 0,
        };
      })
    );
    const sortedPopularItems = itemDetails
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    return {
      byStatus: ordersByStatus,
      avgProcessingTimeHours: parseFloat(avgProcessingTimeHours.toFixed(2)),
      popularItems: sortedPopularItems
    };
  } catch (error: any) {
    console.error("Error in getOrderMetrics:", error);
    throw new Error(`Error getting order metrics: ${error.message}`);
  }
}
