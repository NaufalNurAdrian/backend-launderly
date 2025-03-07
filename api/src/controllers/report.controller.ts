import { generateOutletReportService, getOutletComparisonService } from "../services/report/getAnalitics.service";
import { getEmployeePerformanceService } from "../services/report/getEmployeePerformance.service";
import { getSalesReportService } from "../services/report/getSalesReport.service";
import { Request, Response } from "express";

export class ReportController {
  async getEmployeePerformanceController(req: Request, res: Response) {
    try {
      const { filterOutlet, filterMonth, filterYear } = req.query;
      const result = await getEmployeePerformanceService({
        filterOutlet: filterOutlet as string,
        filterMonth: filterMonth as string,
        filterYear: filterYear as string,
        id: Number(req.user?.id),
      });
      res
        .status(200)
        .send({ message: "Successfully fetched employee performance", result });
    } catch (error: any) {
      res.status(500).send({
        message: error.message || "Failed to get employee performance",
      });
    }
  }

  async getSalesReportController(req: Request, res: Response) {
    try {
      const { filterOutlet, filterMonth, filterYear } = req.query;
      const result = await getSalesReportService({
        filterOutlet: filterOutlet as string,
        filterMonth: filterMonth as string,
        filterYear: filterYear as string,
        id: Number(req.user?.id),
      });
      res
        .status(200)
        .send({ message: "Successfully fetched sales report", result });
    } catch (error: any) {
      res
        .status(500)
        .send({ message: error.message || "Failed to get sales report" });
    }
  }

  async generateOutletReport(req: Request, res: Response) {
    try {
      const { outletId, startDate, endDate, timeframe, reportType } = req.query;

      // Parse and validate inputs
      const filters = {
        outletId: outletId ? parseInt(outletId as string) : undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        timeframe: ((timeframe as string) || "daily") as
          | "daily"
          | "weekly"
          | "monthly"
          | "custom",
        reportType: ((reportType as string) || "comprehensive") as
          | "transactions"
          | "revenue"
          | "customers"
          | "orders"
          | "comprehensive",
      };

      const reportData = await generateOutletReportService(filters);

      res.status(200).json({
        success: true,
        data: reportData,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async compareOutlets(req: Request, res: Response) {
    try {
      const { timeframe } = req.query;

      const comparisonData = await getOutletComparisonService(
        ((timeframe as string) || "monthly") as
          | "daily"
          | "weekly"
          | "monthly"
          | "custom"
      );

      res.status(200).json({
        success: true,
        data: comparisonData,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get transaction trends over time
   */
  async getTransactionTrends(req: Request, res: Response) {
    try {
      const { outletId, period, startDate, endDate } = req.query;

      // For trends, we need custom date handling to group by day/week/month
      const filters = {
        outletId: outletId ? parseInt(outletId as string) : undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        timeframe: "custom" as "daily" | "weekly" | "monthly" | "custom",
        reportType: "revenue" as
          | "transactions"
          | "revenue"
          | "customers"
          | "orders"
          | "comprehensive",
      };

      const reportData = await generateOutletReportService(filters);

      // Extract the daily revenue for trending
      const trends = reportData.revenue.daily;

      res.status(200).json({
        success: true,
        data: {
          trends,
          period: period || "daily",
          totalRevenue: reportData.revenue.total,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get customer analytics
   */
  async getCustomerAnalytics(req: Request, res: Response) {
    try {
      const { outletId, timeframe } = req.query;

      const filters = {
        outletId: outletId ? parseInt(outletId as string) : undefined,
        timeframe: ((timeframe as string) || "monthly") as
          | "daily"
          | "weekly"
          | "monthly"
          | "custom",
        reportType: "customers" as
          | "transactions"
          | "revenue"
          | "customers"
          | "orders"
          | "comprehensive",
      };

      const reportData = await generateOutletReportService(filters);

      res.status(200).json({
        success: true,
        data: reportData.customers,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
