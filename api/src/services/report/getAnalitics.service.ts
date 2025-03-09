import { ReportFilters, ReportTimeframe } from "@/types/report";
import prisma from "../../prisma";
import { 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  subDays, 
  subWeeks, 
  subMonths, 
  startOfYear, 
  endOfYear 
} from "date-fns";
import { getTransactionMetrics } from "./transactionMetrics.service";
import { getRevenueMetrics } from "./revenueMetrics.service";
import { getCustomerMetrics } from "./customerMetrics.service";
import { getOrderMetrics } from "./orderMetrics.service";

export const generateOutletReportService = async (filters: ReportFilters) => {
  try {
    const {
      outletId,
      startDate,
      endDate,
      timeframe = "daily",
      reportType = "comprehensive"
    } = filters;

    let dateStart = startDate;
    let dateEnd = endDate;

    // If dates aren't provided, calculate appropriate date ranges based on timeframe
    if (!startDate || !endDate) {
      const today = new Date();
      
      switch (timeframe) {
        case "daily":
          // Use the last 30 days for daily view
          dateStart = startOfDay(subDays(today, 29)); // 30 days including today
          dateEnd = endOfDay(today);
          break;
          
        case "weekly":
          // Use the last 12 weeks for weekly view
          dateStart = startOfDay(subWeeks(today, 11)); // 12 weeks including current week
          dateEnd = endOfDay(today);
          break;
          
        case "monthly":
          // Use current year for monthly view
          dateStart = startOfYear(today);
          dateEnd = endOfYear(today);
          break;
          
        case "yearly":
          // Use last 5 years for yearly view
          dateStart = startOfYear(new Date(today.getFullYear() - 4, 0, 1));
          dateEnd = endOfYear(today);
          break;
          
        case "custom":
          // For custom timeframe with no dates, default to last 30 days
          dateStart = startOfDay(subDays(today, 29));
          dateEnd = endOfDay(today);
          break;
          
        default:
          dateStart = startOfDay(subDays(today, 29));
          dateEnd = endOfDay(today);
      }
    }

    // Create base where clause
    const baseWhereClause: any = {
      createdAt: {
        gte: dateStart,
        lte: dateEnd,
      },
    };

    if (outletId) {
      baseWhereClause.outletId = outletId;
    }

    console.log(`Fetching data from ${dateStart} to ${dateEnd} with timeframe ${timeframe}`);

    let reportData: any = {};

    // Pass the timeframe to each metrics service so they can apply appropriate grouping
    if (reportType === "transactions" || reportType === "comprehensive") {
      const transactionMetrics = await getTransactionMetrics(baseWhereClause, timeframe);
      reportData.transactions = transactionMetrics;
    }

    if (reportType === "revenue" || reportType === "comprehensive") {
      const revenueMetrics = await getRevenueMetrics(baseWhereClause, timeframe);
      reportData.revenue = revenueMetrics;
    }

    if (reportType === "customers" || reportType === "comprehensive") {
      const customerMetrics = await getCustomerMetrics(baseWhereClause, timeframe);
      reportData.customers = customerMetrics;
    }

    if (reportType === "orders" || reportType === "comprehensive") {
      const orderMetrics = await getOrderMetrics(baseWhereClause, timeframe);
      reportData.orders = orderMetrics;
    }

    if (outletId) {
      const outlet = await prisma.outlet.findUnique({
        where: { id: outletId },
        select: {
          id: true,
          outletName: true,
          outletType: true,
        },
      });
      reportData.outletDetails = outlet;
    }

    reportData.metadata = {
      generatedAt: new Date(),
      timeframe,
      dateRange: {
        from: dateStart,
        to: dateEnd,
      },
    };

    return reportData;
  } catch (error: any) {
    console.error("Error in generateOutletReportService:", error);
    throw new Error(`Error generating outlet report: ${error.message}`);
  }
};
