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
  endOfYear,
  format
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

    // Log request parameters
    console.log("Report generation request:", {
      outletId,
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      timeframe,
      reportType
    });

    let dateStart = startDate;
    let dateEnd = endDate;

    // If dates aren't provided or for custom timeframe, calculate appropriate date ranges
    if ((!startDate || !endDate)) {
      // For custom timeframe without dates, show an error
      if (timeframe === "custom") {
        throw new Error("Date range is required for custom time period");
      }
      
      // Calculate default date ranges for other timeframes
      const today = new Date();
      
      switch (timeframe) {
        case "daily":
          // Use just today for daily view
          dateStart = startOfDay(today);
          dateEnd = endOfDay(today);
          break;
          
        case "weekly":
          // Use exactly 7 days for weekly view (including today)
          dateStart = startOfDay(subDays(today, 6));
          dateEnd = endOfDay(today);
          break;
          
        case "monthly":
          // Use current month for monthly view
          dateStart = startOfMonth(today);
          dateEnd = endOfMonth(today);
          break;
          
        case "yearly":
          // Use current year for yearly view
          dateStart = startOfYear(today);
          dateEnd = endOfYear(today);
          break;
          
        default:
          dateStart = startOfDay(today);
          dateEnd = endOfDay(today);
      }
    }

    // Pada titik ini, dateStart dan dateEnd seharusnya selalu didefinisikan
    // tapi TypeScript tidak bisa mengetahuinya, jadi kita perlu memastikan
    if (!dateStart || !dateEnd) {
      // Fallback jika somehow masih undefined
      const today = new Date();
      dateStart = startOfDay(today);
      dateEnd = endOfDay(today);
    }

    // Create base where clause with properly formatted dates
    const baseWhereClause: any = {
      createdAt: {
        gte: dateStart,
        lte: dateEnd,
      },
    };

    if (outletId) {
      baseWhereClause.outletId = outletId;
    }

    // Sekarang dateStart dan dateEnd sudah pasti tidak undefined
    console.log(`Fetching data from ${format(dateStart, 'yyyy-MM-dd HH:mm:ss')} to ${format(dateEnd, 'yyyy-MM-dd HH:mm:ss')} with timeframe ${timeframe}`);

    // Generate report data with the metric services
    let reportData: any = {};

    // Pass the timeframe to each metrics service
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

    // Add metadata
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