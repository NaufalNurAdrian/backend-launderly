import { ReportFilters, ReportTimeframe } from "@/types/report";
import prisma from "../../prisma";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
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

    if (!startDate || !endDate) {
      const today = new Date();
      switch (timeframe) {
        case "daily":
          dateStart = startOfDay(today);
          dateEnd = endOfDay(today);
          break;
        case "weekly":
          dateStart = startOfWeek(today);
          dateEnd = endOfWeek(today);
          break;
        case "monthly":
          dateStart = startOfMonth(today);
          dateEnd = endOfMonth(today);
          break;
        default:
          dateStart = startOfDay(today);
          dateEnd = endOfDay(today);
      }
    }

    const baseWhereClause: any = {
      createdAt: {
        gte: dateStart,
        lte: dateEnd,
      },
    };

    if (outletId) {
      baseWhereClause.outletId = outletId;
    }

    let reportData: any = {};

    if (reportType === "transactions" || reportType === "comprehensive") {
      const transactionMetrics = await getTransactionMetrics(baseWhereClause);
      reportData.transactions = transactionMetrics;
    }

    if (reportType === "revenue" || reportType === "comprehensive") {
      const revenueMetrics = await getRevenueMetrics(baseWhereClause);
      reportData.revenue = revenueMetrics;
    }

    if (reportType === "customers" || reportType === "comprehensive") {
      const customerMetrics = await getCustomerMetrics(baseWhereClause);
      reportData.customers = customerMetrics;
    }

    if (reportType === "orders" || reportType === "comprehensive") {
      const orderMetrics = await getOrderMetrics(baseWhereClause);
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
    throw new Error(`Error generating outlet report: ${error.message}`);
  }
};

export const getOutletComparisonService = async (timeframe: ReportTimeframe = "monthly") => {
  try {
    const today = new Date();
    let dateStart: Date;
    let dateEnd = endOfDay(today);

    switch (timeframe) {
      case "daily":
        dateStart = startOfDay(today);
        break;
      case "weekly":
        dateStart = startOfWeek(today);
        break;
      case "monthly":
        dateStart = startOfMonth(today);
        break;
      default:
        dateStart = startOfMonth(today);
    }

    const outlets = await prisma.outlet.findMany({
      where: {
        isDelete: false,
      },
      select: {
        id: true,
        outletName: true,
        outletType: true,
      },
    });

    const outletPerformance = await Promise.all(
      outlets.map(async outlet => {
        const reportData = await generateOutletReportService({
          outletId: outlet.id,
          startDate: dateStart,
          endDate: dateEnd,
          timeframe: timeframe,
          reportType: "comprehensive",
        });
        return {
          id: outlet.id,
          name: outlet.outletName,
          type: outlet.outletType,
          revenue: reportData.revenue.total,
          orders: reportData.orders?.byStatus.reduce(
            (sum: number, status: any) => sum + status._count,
            0
          ) || 0,
          customers: reportData.customers?.active || 0,
        };
      })
    );

    return {
      outlets: outletPerformance,
      timeframe,
      dateRange: {
        from: dateStart,
        to: dateEnd,
      },
    };
  } catch (error: any) {
    throw new Error(`Error generating outlet comparison: ${error.message}`);
  }
};
