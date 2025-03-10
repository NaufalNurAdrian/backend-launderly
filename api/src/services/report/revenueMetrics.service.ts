import prisma from "../../prisma";
import { ReportTimeframe } from "@/types/report";
import { 
  startOfDay, endOfDay, 
  startOfWeek, endOfWeek, 
  startOfMonth, endOfMonth, 
  startOfYear, endOfYear,
  format, isWithinInterval
} from "date-fns";

export async function getRevenueMetrics(baseWhereClause: any, timeframe: ReportTimeframe = "daily") {
  try {
    console.log(`Revenue metrics where clause (timeframe: ${timeframe}):`, JSON.stringify(baseWhereClause, null, 2));
    
    // Create specific where clause for order queries
    const orderWhereClause: any = {};
    
    // Apply date filter
    if (baseWhereClause.createdAt) {
      orderWhereClause.createdAt = baseWhereClause.createdAt;
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

    console.log(`Found ${orders.length} orders for revenue calculation`);

    // Determine current period based on timeframe for "right now" calculations
    const now = new Date();
    let currentPeriodStart: Date;
    let currentPeriodEnd: Date;
    
    switch (timeframe) {
      case "daily":
        currentPeriodStart = startOfDay(now);
        currentPeriodEnd = endOfDay(now);
        break;
      case "weekly":
        currentPeriodStart = startOfWeek(now, { weekStartsOn: 1 }); // Week starts on Monday
        currentPeriodEnd = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case "monthly":
        currentPeriodStart = startOfMonth(now);
        currentPeriodEnd = endOfMonth(now);
        break;
      case "yearly":
        currentPeriodStart = startOfYear(now);
        currentPeriodEnd = endOfYear(now);
        break;
      default:
        currentPeriodStart = startOfDay(now);
        currentPeriodEnd = endOfDay(now);
    }
    
    // Filter orders for current period (if timeframe is not custom)
    const currentPeriodOrders = timeframe !== "custom" 
      ? orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return isWithinInterval(orderDate, {
            start: currentPeriodStart,
            end: currentPeriodEnd
          });
        })
      : orders;
    
    console.log(`Current period (${timeframe}) has ${currentPeriodOrders.length} orders`);

    // Calculate totals for the CURRENT PERIOD (based on timeframe)
    let totalRevenue = 0;
    let laundryRevenue = 0;
    let pickupRevenue = 0;
    let deliveryRevenue = 0;

    currentPeriodOrders.forEach(order => {
      const laundryPayments = order.payment.reduce((sum, payment) => sum + payment.amount, 0);
      laundryRevenue += laundryPayments;

      if (order.pickupOrder) {
        pickupRevenue += order.pickupOrder.pickupPrice;
      }

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

    // Create daily revenue breakdown (this stays as is - showing all dates with data)
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
    console.log(`Total revenue for current ${timeframe}: ${totalRevenue}`);

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