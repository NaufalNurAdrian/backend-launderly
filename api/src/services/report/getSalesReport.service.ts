import prisma from "../../prisma";
import { Prisma } from "../../../prisma/generated/client";
import {
  endOfMonth,
  startOfMonth,
  getDaysInMonth,
  startOfYear,
  endOfYear,
  subDays,
  startOfDay,
  endOfDay,
  subWeeks,
  startOfWeek,
  endOfWeek,
  format,
  eachDayOfInterval,
  eachWeekOfInterval,
  parseISO
} from "date-fns";

interface GetSalesReportQuery {
  filterOutlet: number | string;
  filterMonth: string;
  filterYear: string;
  id: number;
  timeframe?: "daily" | "weekly" | "monthly" | "yearly" | "custom";
  startDate?: string;
  endDate?: string;
}

export const getSalesReportService = async (query: GetSalesReportQuery) => {
  try {
    const { id, filterOutlet, filterMonth, filterYear, timeframe = "monthly", startDate, endDate } = query;

    // Log the query parameters
    console.log("Sales report query:", {
      filterOutlet,
      filterMonth,
      filterYear,
      timeframe,
      startDate,
      endDate
    });

    const existingUser = await prisma.user.findFirst({
      where: { id },
      select: {
        employee: { select: { outlet: { select: { id: true } } } },
        role: true,
      },
    });

    if (!existingUser) throw new Error("User not found!");

    // Define the order where clause based on user role and filter
    const orderWhereClause: any = {};
    
    if (existingUser.role !== "SUPER_ADMIN") {
      orderWhereClause.pickupOrder = { 
        outletId: existingUser.employee?.outlet?.id 
      };
    } else if (filterOutlet !== "all") {
      orderWhereClause.pickupOrder = { 
        outletId: Number(filterOutlet) 
      };
    }

    // Get orders for status counts
    const allOrders = await prisma.order.findMany({
      where: orderWhereClause,
    });

    let totalOrders = allOrders.length;
    let receivedAtOutlet = allOrders.filter(order => order.orderStatus === "ARRIVED_AT_OUTLET").length;
    let onProgress = allOrders.filter(order =>
      ["READY_FOR_WASHING", "BEING_WASHED", "WASHING_COMPLETED", "BEING_IRONED", "IRONING_COMPLETED", "BEING_PACKED"].includes(order.orderStatus)
    ).length;
    let completed = allOrders.filter(order => order.orderStatus === "COMPLETED").length;

    const now = new Date();
    const year = filterYear ? Number(filterYear) : now.getFullYear();
    const month = filterMonth ? Number(filterMonth) - 1 : now.getMonth();

    // Define timeframe-specific date ranges
    let timeframeStartDate: Date;
    let timeframeEndDate: Date;
    
    // Handle custom timeframe with explicit dates
    if (timeframe === "custom" && startDate && endDate) {
      timeframeStartDate = parseISO(startDate);
      timeframeEndDate = parseISO(endDate);
      
      // Set proper time components
      timeframeStartDate.setHours(0, 0, 0, 0);
      timeframeEndDate.setHours(23, 59, 59, 999);
      
      console.log(`Using custom date range: ${format(timeframeStartDate, 'yyyy-MM-dd')} to ${format(timeframeEndDate, 'yyyy-MM-dd')}`);
    } else {
      // Standard timeframes
      switch (timeframe) {
        case "daily":
          // Today only
          timeframeStartDate = startOfDay(now);
          timeframeEndDate = endOfDay(now);
          break;
          
        case "weekly":
          // Last 7 days
          timeframeStartDate = startOfDay(subDays(now, 6)); // 6 days ago + today = 7 days
          timeframeEndDate = endOfDay(now);
          break;
          
        case "monthly":
          // Current month only
          timeframeStartDate = startOfMonth(now);
          timeframeEndDate = endOfMonth(now);
          break;
          
        case "yearly":
          // Current year only
          timeframeStartDate = startOfYear(now);
          timeframeEndDate = endOfYear(now);
          break;
          
        default:
          // Default to monthly (current month)
          timeframeStartDate = startOfMonth(now);
          timeframeEndDate = endOfMonth(now);
      }
    }

    console.log(`Using timeframe ${timeframe} from ${format(timeframeStartDate, 'yyyy-MM-dd')} to ${format(timeframeEndDate, 'yyyy-MM-dd')}`);

    // Get the orders for the selected timeframe (for total calculations)
    const timeframeWhereClause = { ...orderWhereClause };
    timeframeWhereClause.createdAt = {
      gte: timeframeStartDate,
      lte: timeframeEndDate
    };
    timeframeWhereClause.payment = {
      some: {
        paymentStatus: "SUCCESSED"
      }
    };

    const timeframeOrders = await prisma.order.findMany({
      where: timeframeWhereClause,
      include: {
        payment: {
          where: {
            paymentStatus: "SUCCESSED"
          }
        },
        pickupOrder: true,
        deliveryOrder: true
      }
    });

    console.log(`Found ${timeframeOrders.length} orders in the selected timeframe`);

    // Calculate totals for the timeframe
    let totalIncome = 0;
    let totalTransaction = timeframeOrders.length;
    let totalWeight = 0;

    timeframeOrders.forEach(order => {
      // Sum all successful payments for this order
      const laundryPayments = order.payment.reduce((sum, payment) => sum + payment.amount, 0);
      let orderIncome = laundryPayments;
      
      // Add pickup price if exists
      if (order.pickupOrder) {
        orderIncome += order.pickupOrder.pickupPrice;
      }
      
      // Add delivery price if exists
      if (order.deliveryOrder && Array.isArray(order.deliveryOrder) && order.deliveryOrder.length > 0) {
        orderIncome += order.deliveryOrder[0].deliveryPrice;
      } else if (order.deliveryOrder && !Array.isArray(order.deliveryOrder)) {
        const delivery = order.deliveryOrder as any;
        orderIncome += Number(delivery.deliveryPrice) || 0;
      }
      
      // Add to totals
      totalIncome += orderIncome;
      totalWeight += order.weight ?? 0;
    });

    // Now, prepare chart data
    // For daily chart data (30 days)
    const dailyStartDate = startOfDay(subDays(now, 29));
    const dailyEndDate = endOfDay(now);
    const dailyRangeArray = eachDayOfInterval({ start: dailyStartDate, end: dailyEndDate });
    const dateLabels = dailyRangeArray.map(date => format(date, 'yyyy-MM-dd'));

    // For monthly chart data (selected month or current month)
    const monthlyStartDate = startOfMonth(new Date(year, month));
    const monthlyEndDate = endOfMonth(new Date(year, month));

    // Get orders for chart data
    const chartWhereClause = { ...orderWhereClause };
    
    // Use the same date range as the timeframe for consistency
    chartWhereClause.createdAt = {
      gte: dailyStartDate,
      lte: dailyEndDate
    };
    
    chartWhereClause.payment = {
      some: {
        paymentStatus: "SUCCESSED"
      }
    };

    const chartOrders = await prisma.order.findMany({
      where: chartWhereClause,
      include: {
        payment: {
          where: {
            paymentStatus: "SUCCESSED"
          }
        },
        pickupOrder: true,
        deliveryOrder: true
      }
    });

    console.log(`Found ${chartOrders.length} orders for chart data in 30-day range`);

    // Initialize arrays for chart data
    let incomeDaily = new Array(30).fill(0);
    let transactionDaily = new Array(30).fill(0);
    let weightDaily = new Array(30).fill(0);

    // Process orders for daily chart data
    chartOrders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const dayDifference = Math.floor((orderDate.getTime() - dailyStartDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDifference >= 0 && dayDifference < 30) {
        // Calculate total income for this order
        let orderIncome = order.payment.reduce((sum, payment) => sum + payment.amount, 0);
        
        // Add pickup and delivery prices
        if (order.pickupOrder) {
          orderIncome += order.pickupOrder.pickupPrice;
        }
        
        if (order.deliveryOrder && Array.isArray(order.deliveryOrder) && order.deliveryOrder.length > 0) {
          orderIncome += order.deliveryOrder[0].deliveryPrice;
        } else if (order.deliveryOrder && !Array.isArray(order.deliveryOrder)) {
          const delivery = order.deliveryOrder as any;
          orderIncome += Number(delivery.deliveryPrice) || 0;
        }
        
        // Update daily arrays
        incomeDaily[dayDifference] += orderIncome;
        transactionDaily[dayDifference] += 1;
        weightDaily[dayDifference] += order.weight ?? 0;
      }
    });

    // For weekly chart data (12 weeks)
    const weeklyStartDate = startOfWeek(subWeeks(now, 11));
    const weeklyEndDate = endOfWeek(now);
    const weeklyRangeArray = eachWeekOfInterval({ start: weeklyStartDate, end: weeklyEndDate });
    const weekLabels = weeklyRangeArray.map(week => {
      const weekStart = startOfWeek(week);
      const weekEnd = endOfWeek(week);
      return `${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd')}`;
    });

    // Initialize monthly arrays
    const incomeMonthly = new Array(12).fill(0);
    const transactionMonthly = new Array(12).fill(0);
    const weightMonthly = new Array(12).fill(0);

    // Process monthly data for the selected year
    for (let i = 0; i < 12; i++) {
      const monthStart = startOfMonth(new Date(year, i));
      const monthEnd = endOfMonth(new Date(year, i));
      
      // Create a copy of order where clause with updated date range
      const monthlyWhereClause = { ...orderWhereClause };
      monthlyWhereClause.createdAt = { 
        gte: monthStart, 
        lte: monthEnd 
      };
      
      monthlyWhereClause.payment = {
        some: {
          paymentStatus: "SUCCESSED"
        }
      };

      // Get orders for this month
      const monthlyOrders = await prisma.order.findMany({
        where: monthlyWhereClause,
        include: {
          payment: {
            where: {
              paymentStatus: "SUCCESSED"
            }
          },
          pickupOrder: true,
          deliveryOrder: true
        }
      });
      
      let monthlyIncome = 0;
      
      monthlyOrders.forEach(order => {
        // Sum payments
        const laundryAmount = order.payment.reduce((sum, payment) => sum + payment.amount, 0);
        monthlyIncome += laundryAmount;
        
        // Add pickup price
        if (order.pickupOrder) {
          monthlyIncome += order.pickupOrder.pickupPrice;
        }
        
        // Add delivery price
        if (order.deliveryOrder && Array.isArray(order.deliveryOrder) && order.deliveryOrder.length > 0) {
          monthlyIncome += order.deliveryOrder[0].deliveryPrice;
        } else if (order.deliveryOrder && !Array.isArray(order.deliveryOrder)) {
          const delivery = order.deliveryOrder as any;
          monthlyIncome += Number(delivery.deliveryPrice) || 0;
        }
        
        // Calculate total weight
        weightMonthly[i] += order.weight ?? 0;
      });
      
      incomeMonthly[i] = monthlyIncome;
      transactionMonthly[i] = monthlyOrders.length;
    }

    // Initialize yearly arrays
    const currentYear = new Date().getFullYear();
    const pastYears = Array.from(
      { length: 5 },
      (_, i) => currentYear - i
    ).reverse();
    const incomeYearly = new Array(5).fill(0);
    const transactionYearly = new Array(5).fill(0);
    const weightYearly = new Array(5).fill(0);

    // Process yearly data
    for (let i = 0; i < pastYears.length; i++) {
      const yearStart = startOfYear(new Date(pastYears[i], 0, 1));
      const yearEnd = endOfYear(new Date(pastYears[i], 11, 31));
      
      // Create a copy of order where clause with updated date range
      const yearlyWhereClause = { ...orderWhereClause };
      yearlyWhereClause.createdAt = { 
        gte: yearStart, 
        lte: yearEnd 
      };
      
      yearlyWhereClause.payment = {
        some: {
          paymentStatus: "SUCCESSED"
        }
      };

      // Get orders for this year
      const yearlyOrders = await prisma.order.findMany({
        where: yearlyWhereClause,
        include: {
          payment: {
            where: {
              paymentStatus: "SUCCESSED"
            }
          },
          pickupOrder: true,
          deliveryOrder: true
        }
      });
      
      let yearlyIncome = 0;
      
      yearlyOrders.forEach(order => {
        // Sum payments
        const laundryAmount = order.payment.reduce((sum, payment) => sum + payment.amount, 0);
        yearlyIncome += laundryAmount;
        
        // Add pickup price
        if (order.pickupOrder) {
          yearlyIncome += order.pickupOrder.pickupPrice;
        }
        
        // Add delivery price
        if (order.deliveryOrder && Array.isArray(order.deliveryOrder) && order.deliveryOrder.length > 0) {
          yearlyIncome += order.deliveryOrder[0].deliveryPrice;
        } else if (order.deliveryOrder && !Array.isArray(order.deliveryOrder)) {
          const delivery = order.deliveryOrder as any;
          yearlyIncome += Number(delivery.deliveryPrice) || 0;
        }
        
        // Calculate total weight
        weightYearly[i] += order.weight ?? 0;
      });
      
      incomeYearly[i] = yearlyIncome;
      transactionYearly[i] = yearlyOrders.length;
    }

    console.log("Sales report calculation complete");

    return {
      message: "Successfully fetched sales report",
      result: {
        totalIncome,
        totalTransaction,
        totalOrders,
        receivedAtOutlet,
        onProgress,
        completed,
        totalWeight,
        incomeDaily,
        transactionDaily,
        weightDaily,
        incomeMonthly,
        transactionMonthly,
        weightMonthly,
        pastYears,
        incomeYearly,
        transactionYearly,
        weightYearly,
        timeframe,
        dateLabels 
      },
    };
  } catch (error) {
    console.error("Error in getSalesReportService:", error);
    throw error;
  }
};