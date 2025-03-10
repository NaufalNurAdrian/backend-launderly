import prisma from "../../prisma";
import { ReportTimeframe } from "@/types/report";
import { format } from "date-fns";

export async function getRevenueMetrics(baseWhereClause: any, timeframe: ReportTimeframe = "daily") {
  try {
    console.log(`Revenue metrics where clause (timeframe: ${timeframe}):`, JSON.stringify(baseWhereClause, null, 2));
    
    // Create specific where clause for order queries
    const orderWhereClause: any = {};
    
    // Apply date filter
    if (baseWhereClause.createdAt) {
      orderWhereClause.createdAt = baseWhereClause.createdAt;
      console.log(`Fetching orders from ${format(baseWhereClause.createdAt.gte, 'yyyy-MM-dd HH:mm:ss')} to ${format(baseWhereClause.createdAt.lte, 'yyyy-MM-dd HH:mm:ss')}`);
    }
    
    // Apply outlet filter if present
    if (baseWhereClause.outletId) {
      orderWhereClause.pickupOrder = {
        outletId: baseWhereClause.outletId
      };
    }
    
    // Add payment success filter
    orderWhereClause.payment = {
      some: {
        paymentStatus: "SUCCESSED",
      },
    };
    
    console.log("Order where clause:", JSON.stringify(orderWhereClause, null, 2));

    // Get all orders within date range with successful payments
    const orders = await prisma.order.findMany({
      where: orderWhereClause,
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

    console.log(`Found ${orders.length} orders with successful payments in the specified date range`);

    // IMPORTANT: Use all orders in the date range, not just "current period"
    // This ensures consistency across all reports
    const filteredOrders = orders;
    
    console.log(`Using ${filteredOrders.length} orders for revenue calculations`);

    // Calculate totals for ALL orders in the specified date range
    let totalRevenue = 0;
    let laundryRevenue = 0;
    let pickupRevenue = 0;
    let deliveryRevenue = 0;

    filteredOrders.forEach(order => {
      // Sum laundry payments
      const laundryPayments = order.payment.reduce((sum, payment) => sum + payment.amount, 0);
      laundryRevenue += laundryPayments;

      // Add pickup revenue if exists
      if (order.pickupOrder) {
        pickupRevenue += order.pickupOrder.pickupPrice;
      }

      // Add delivery revenue if exists
      if (order.deliveryOrder && Array.isArray(order.deliveryOrder) && order.deliveryOrder.length > 0) {
        deliveryRevenue += order.deliveryOrder[0].deliveryPrice;
      } else if (order.deliveryOrder && !Array.isArray(order.deliveryOrder)) {
        // Handle case where deliveryOrder might not be an array
        const delivery = order.deliveryOrder as any;
        if (delivery.deliveryPrice) {
          deliveryRevenue += delivery.deliveryPrice;
        }
      }
    });

    totalRevenue = laundryRevenue + pickupRevenue + deliveryRevenue;

    // Create daily revenue breakdown for all dates with data
    const dailyRevenueMap = new Map();
    filteredOrders.forEach(order => {
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
      
      // Add laundry amount
      const laundryAmount = order.payment.reduce((sum, payment) => sum + payment.amount, 0);
      dayStats.laundry += laundryAmount;
      
      // Add pickup amount
      if (order.pickupOrder) {
        dayStats.pickup += order.pickupOrder.pickupPrice;
      }
      
      // Add delivery amount
      if (order.deliveryOrder && Array.isArray(order.deliveryOrder) && order.deliveryOrder.length > 0) {
        dayStats.delivery += order.deliveryOrder[0].deliveryPrice;
      } else if (order.deliveryOrder && !Array.isArray(order.deliveryOrder)) {
        const delivery = order.deliveryOrder as any;
        if (delivery.deliveryPrice) {
          dayStats.delivery += delivery.deliveryPrice;
        }
      }
      
      // Calculate total
      dayStats.total = dayStats.laundry + dayStats.pickup + dayStats.delivery;
    });
    
    const dailyRevenue = Array.from(dailyRevenueMap.values())
      .sort((a, b) => a.date.localeCompare(b.date));

    console.log(`Generated ${dailyRevenue.length} daily revenue entries`);
    
    // Verify totals
    const calculatedTotal = dailyRevenue.reduce((sum, day) => sum + day.total, 0);
    
    if (calculatedTotal !== totalRevenue) {
      console.warn(`Total mismatch: calculated sum of daily (${calculatedTotal}) doesn't match total revenue (${totalRevenue}). Using calculated total.`);
      totalRevenue = calculatedTotal;
      laundryRevenue = dailyRevenue.reduce((sum, day) => sum + day.laundry, 0);
      pickupRevenue = dailyRevenue.reduce((sum, day) => sum + day.pickup, 0);
      deliveryRevenue = dailyRevenue.reduce((sum, day) => sum + day.delivery, 0);
    }
    
    console.log(`Revenue breakdown for ${timeframe}:`, {
      total: totalRevenue,
      laundry: laundryRevenue,
      pickup: pickupRevenue,
      delivery: deliveryRevenue
    });

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