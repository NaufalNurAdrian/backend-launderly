import prisma from "../../prisma";

export async function getRevenueMetrics(baseWhereClause: any) {
  try {
    const orders = await prisma.order.findMany({
      where: {
        pickupOrder: {
          outletId: baseWhereClause.outletId,
        },
        createdAt: baseWhereClause.createdAt,
      },
      include: {
        payment: {
          where: {
            paymentStatus: "SUCCESSED",
          },
        },
        pickupOrder: true,
        deliveryOrder: true,
      },
    });

    let totalRevenue = 0;
    let laundryRevenue = 0;
    let pickupRevenue = 0;
    let deliveryRevenue = 0;

    orders.forEach(order => {
      const laundryPayments = order.payment.reduce((sum, payment) => sum + payment.amount, 0);
      laundryRevenue += laundryPayments;

      if (order.pickupOrder) {
        pickupRevenue += order.pickupOrder.pickupPrice;
      }

      if (order.deliveryOrder) {
        deliveryRevenue += order.deliveryOrder?.[0].deliveryPrice;
      }
    });

    totalRevenue = laundryRevenue + pickupRevenue + deliveryRevenue;

    const dailyRevenueMap = new Map();
    orders.forEach(order => {
      const orderDate = order.createdAt.toISOString().split('T')[0];
      if (!dailyRevenueMap.has(orderDate)) {
        dailyRevenueMap.set(orderDate, {
          date: orderDate,
          total: 0,
          laundry: 0,
          pickup: 0,
          delivery: 0,
        });
      }
      const dayStats = dailyRevenueMap.get(orderDate);
      const laundryAmount = order.payment.reduce((sum, payment) => sum + payment.amount, 0);
      dayStats.laundry += laundryAmount;
      if (order.pickupOrder) {
        dayStats.pickup += order.pickupOrder.pickupPrice;
      }
      if (order.deliveryOrder) {
        dayStats.delivery += order.deliveryOrder?.[0].deliveryPrice;
      }
      dayStats.total = dayStats.laundry + dayStats.pickup + dayStats.delivery;
    });
    const dailyRevenue = Array.from(dailyRevenueMap.values())
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      total: totalRevenue,
      breakdown: {
        laundry: laundryRevenue,
        pickup: pickupRevenue,
        delivery: deliveryRevenue
      },
      daily: dailyRevenue
    };
  } catch (error: any) {
    console.error("Error in getRevenueMetrics:", error);
    throw new Error(`Error getting revenue metrics: ${error.message}`);
  }
}
