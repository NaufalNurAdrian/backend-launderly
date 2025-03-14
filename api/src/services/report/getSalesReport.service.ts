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
  parseISO,
  differenceInDays
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

    console.log("Sales report query:", {
      filterOutlet,
      filterMonth,
      filterYear,
      timeframe,
      startDate,
      endDate,
      userId: id
    });

    const existingUser = await prisma.user.findFirst({
      where: { id },
      select: {
        employee: { 
          select: { 
            outlet: { select: { id: true, outletName: true } } 
          } 
        },
        role: true,
      },
    });

    if (!existingUser) throw new Error("User not found!");

    const orderWhereClause: any = {};
    
    if (existingUser.role === "OUTLET_ADMIN") {
      if (!existingUser.employee?.outlet?.id) {
        throw new Error("Outlet admin is not assigned to any outlet");
      }
      
      
      orderWhereClause.pickupOrder = { 
        outletId: existingUser.employee.outlet.id 
      };
    } 
    else if (existingUser.role === "SUPER_ADMIN") {
      if (filterOutlet !== "all") {
        orderWhereClause.pickupOrder = { 
          outletId: Number(filterOutlet) 
        };
      }
      
    }
    else {
      orderWhereClause.pickupOrder = { 
        outletId: existingUser.employee?.outlet?.id 
      };
      
    }

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

    let timeframeStartDate: Date;
    let timeframeEndDate: Date;
    
    if (timeframe === "custom" && startDate && endDate) {
      try {
        timeframeStartDate = parseISO(startDate);
        timeframeEndDate = parseISO(endDate);
        
        timeframeStartDate.setHours(0, 0, 0, 0);
        timeframeEndDate.setHours(23, 59, 59, 999);
      } catch (error) {
        console.error("Error parsing date:", error);
        throw new Error(`Invalid date format: startDate=${startDate}, endDate=${endDate}`);
      }
    } else {
      switch (timeframe) {
        case "daily":
          timeframeStartDate = startOfDay(subDays(now, 29)); 
          timeframeEndDate = endOfDay(now);
          break;
          
        case "weekly":
          timeframeStartDate = startOfDay(subDays(now, 6));
          timeframeEndDate = endOfDay(now);
          break;
          
        case "monthly":
          timeframeStartDate = startOfYear(new Date(year, 0, 1));
          timeframeEndDate = endOfYear(new Date(year, 11, 31));
          break;
          
        case "yearly":
          const startYear = now.getFullYear() - 4;
          timeframeStartDate = startOfYear(new Date(startYear, 0, 1));
          timeframeEndDate = endOfYear(now);
          break;
          
        default:
          timeframeStartDate = startOfYear(new Date(year, 0, 1));
          timeframeEndDate = endOfYear(new Date(year, 11, 31));
      }
    }

    console.log(`Using timeframe ${timeframe} from ${format(timeframeStartDate, 'yyyy-MM-dd')} to ${format(timeframeEndDate, 'yyyy-MM-dd')}`);

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

    let totalIncome = 0;
    let totalTransaction = timeframeOrders.length;
    let totalWeight = 0;

    timeframeOrders.forEach(order => {
      const laundryPayments = order.payment.reduce((sum, payment) => sum + payment.amount, 0);
      let orderIncome = laundryPayments;
      
      if (order.pickupOrder) {
        orderIncome += order.pickupOrder.pickupPrice;
      }
      
      if (order.deliveryOrder && Array.isArray(order.deliveryOrder) && order.deliveryOrder.length > 0) {
        orderIncome += order.deliveryOrder[0].deliveryPrice;
      } else if (order.deliveryOrder && !Array.isArray(order.deliveryOrder)) {
        const delivery = order.deliveryOrder as any;
        orderIncome += Number(delivery.deliveryPrice) || 0;
      }
      
      totalIncome += orderIncome;
      totalWeight += order.weight ?? 0;
    });

    let dateLabels: string[] = [];
    let incomeDaily: number[] = [];
    let transactionDaily: number[] = [];
    let weightDaily: number[] = [];
    
    if (timeframe === "daily" || timeframe === "weekly" || timeframe === "custom") {
      const days = eachDayOfInterval({ 
        start: timeframeStartDate, 
        end: timeframeEndDate 
      });
      
      dateLabels = days.map(date => format(date, 'yyyy-MM-dd'));
      
      incomeDaily = new Array(dateLabels.length).fill(0);
      transactionDaily = new Array(dateLabels.length).fill(0);
      weightDaily = new Array(dateLabels.length).fill(0);
      
      timeframeOrders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        const formattedOrderDate = format(orderDate, 'yyyy-MM-dd');
        const dayIndex = dateLabels.indexOf(formattedOrderDate);
        
        if (dayIndex !== -1) {
          let orderIncome = order.payment.reduce((sum, payment) => sum + payment.amount, 0);
          
          if (order.pickupOrder) {
            orderIncome += order.pickupOrder.pickupPrice;
          }
          
          if (order.deliveryOrder && Array.isArray(order.deliveryOrder) && order.deliveryOrder.length > 0) {
            orderIncome += order.deliveryOrder[0].deliveryPrice;
          } else if (order.deliveryOrder && !Array.isArray(order.deliveryOrder)) {
            const delivery = order.deliveryOrder as any;
            orderIncome += Number(delivery.deliveryPrice) || 0;
          }
          
          incomeDaily[dayIndex] += orderIncome;
          transactionDaily[dayIndex] += 1;
          weightDaily[dayIndex] += order.weight ?? 0;
        }
      });
    }

    const incomeMonthly = new Array(12).fill(0);
    const transactionMonthly = new Array(12).fill(0);
    const weightMonthly = new Array(12).fill(0);

    if (timeframe === "monthly") {
      for (let month = 0; month < 12; month++) {
        const monthStart = startOfMonth(new Date(year, month));
        const monthEnd = endOfMonth(new Date(year, month));
        
        const monthOrders = timeframeOrders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= monthStart && orderDate <= monthEnd;
        });
        
        let monthIncome = 0;
        let monthWeight = 0;
        
        monthOrders.forEach(order => {
          let orderIncome = order.payment.reduce((sum, payment) => sum + payment.amount, 0);
          
          if (order.pickupOrder) {
            orderIncome += order.pickupOrder.pickupPrice;
          }
          
          if (order.deliveryOrder && Array.isArray(order.deliveryOrder) && order.deliveryOrder.length > 0) {
            orderIncome += order.deliveryOrder[0].deliveryPrice;
          } else if (order.deliveryOrder && !Array.isArray(order.deliveryOrder)) {
            const delivery = order.deliveryOrder as any;
            orderIncome += Number(delivery.deliveryPrice) || 0;
          }
          
          monthIncome += orderIncome;
          monthWeight += order.weight ?? 0;
        });
        
        incomeMonthly[month] = monthIncome;
        transactionMonthly[month] = monthOrders.length;
        weightMonthly[month] = monthWeight;
      }
    }

    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 4;
    const pastYears = Array.from(
      { length: 5 },
      (_, i) => startYear + i
    );
    
    const incomeYearly = new Array(pastYears.length).fill(0);
    const transactionYearly = new Array(pastYears.length).fill(0);
    const weightYearly = new Array(pastYears.length).fill(0);

    if (timeframe === "yearly") {
      pastYears.forEach((year, index) => {
        const yearStart = startOfYear(new Date(year, 0, 1));
        const yearEnd = endOfYear(new Date(year, 11, 31));
        
        const yearOrders = timeframeOrders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= yearStart && orderDate <= yearEnd;
        });
        
        let yearIncome = 0;
        let yearWeight = 0;
        
        yearOrders.forEach(order => {
          let orderIncome = order.payment.reduce((sum, payment) => sum + payment.amount, 0);
          
          if (order.pickupOrder) {
            orderIncome += order.pickupOrder.pickupPrice;
          }
          
          if (order.deliveryOrder && Array.isArray(order.deliveryOrder) && order.deliveryOrder.length > 0) {
            orderIncome += order.deliveryOrder[0].deliveryPrice;
          } else if (order.deliveryOrder && !Array.isArray(order.deliveryOrder)) {
            const delivery = order.deliveryOrder as any;
            orderIncome += Number(delivery.deliveryPrice) || 0;
          }
          
          yearIncome += orderIncome;
          yearWeight += order.weight ?? 0;
        });
        
        incomeYearly[index] = yearIncome;
        transactionYearly[index] = yearOrders.length;
        weightYearly[index] = yearWeight;
      });
    }

    let outletInfo = null;
    if (existingUser.role === "OUTLET_ADMIN" && existingUser.employee?.outlet) {
      outletInfo = {
        id: existingUser.employee.outlet.id,
        name: existingUser.employee.outlet.outletName
      };
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
        dateLabels,
        outletInfo,
        hasData: totalIncome > 0
      },
    };
  } catch (error) {
    console.error("Error in getSalesReportService:", error);
    throw error;
  }
};