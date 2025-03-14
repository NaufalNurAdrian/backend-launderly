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

interface ExtendedReportFilters extends ReportFilters {
  userId: number;
  requestedOutletId?: number;
}

export const generateOutletReportService = async (filters: ExtendedReportFilters) => {
  try {
    const {
      requestedOutletId,
      startDate,
      endDate,
      timeframe = "daily",
      reportType = "comprehensive",
      userId
    } = filters;

    const existingUser = await prisma.user.findFirst({
      where: { id: userId },
      select: {
        role: true,
        employee: { 
          select: { 
            outlet: { select: { id: true, outletName: true } } 
          } 
        },
      },
    });

    if (!existingUser) {
      throw new Error("User not found!");
    }

    let effectiveOutletId: number | undefined = requestedOutletId;

    if (existingUser.role === "OUTLET_ADMIN") {
      if (!existingUser.employee?.outlet?.id) {
        throw new Error("Outlet admin is not assigned to any outlet");
      }
      
      effectiveOutletId = existingUser.employee.outlet.id;
    } 
    else if (existingUser.role === "SUPER_ADMIN") {
      console.log(`User is SUPER_ADMIN ${effectiveOutletId ? `- Filtering by outlet ID: ${effectiveOutletId}` : '- Viewing all outlets'}`);
    }
    else {
      if (!existingUser.employee?.outlet?.id) {
        throw new Error("Employee is not assigned to any outlet");
      }
      
      effectiveOutletId = existingUser.employee.outlet.id;
    }

    let dateStart = startDate;
    let dateEnd = endDate;

    if ((!startDate || !endDate)) {
      if (timeframe === "custom") {
        throw new Error("Date range is required for custom time period");
      }
      
      const today = new Date();
      
      switch (timeframe) {
        case "daily":
          dateStart = startOfDay(today);
          dateEnd = endOfDay(today);
          break;
          
        case "weekly":
          dateStart = startOfDay(subDays(today, 6));
          dateEnd = endOfDay(today);
          break;
          
        case "monthly":
          dateStart = startOfMonth(today);
          dateEnd = endOfMonth(today);
          break;
          
        case "yearly":
          dateStart = startOfYear(today);
          dateEnd = endOfYear(today);
          break;
          
        default:
          dateStart = startOfDay(subDays(today, 29));
          dateEnd = endOfDay(today);
      }
    }

    if (!dateStart || !dateEnd) {
      const today = new Date();
      dateStart = startOfDay(today);
      dateEnd = endOfDay(today);
    }

    const baseWhereClause: any = {
      createdAt: {
        gte: dateStart,
        lte: dateEnd,
      },
    };

    if (effectiveOutletId) {
      baseWhereClause.outletId = effectiveOutletId;
    }

    console.log(`Fetching data from ${format(dateStart, 'yyyy-MM-dd HH:mm:ss')} to ${format(dateEnd, 'yyyy-MM-dd HH:mm:ss')} with timeframe ${timeframe}`);
    console.log(`Using outlet filter: ${effectiveOutletId || 'All outlets'}`);

    let reportData: any = {};

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

    if (effectiveOutletId) {
      const outlet = await prisma.outlet.findUnique({
        where: { id: effectiveOutletId },
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
      userRole: existingUser.role
    };

    return reportData;
  } catch (error: any) {
    console.error("Error in generateOutletReportService:", error);
    throw new Error(`Error generating outlet report: ${error.message}`);
  }
};