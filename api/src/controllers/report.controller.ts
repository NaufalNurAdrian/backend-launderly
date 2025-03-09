import { Request, Response } from "express";
import { getSalesReportService } from "../services/report/getSalesReport.service";
import { getEmployeePerformanceService } from "../services/report/getEmployeePerformance.service";
import { generateOutletReportService } from "../services/report/getAnalitics.service";
import { getOutletComparisonService } from "../services/report/getOutletComparisonService";
import { ReportTimeframe } from "@/types/report";

export class ReportController {
  async getSalesReportController(req: Request, res: Response) {
    try {
      const { filterOutlet, filterMonth, filterYear, timeframe } = req.query;
      const result = await getSalesReportService({
        filterOutlet: filterOutlet as string,
        filterMonth: filterMonth as string,
        filterYear: filterYear as string,
        timeframe: timeframe as "daily" | "weekly" | "monthly" | undefined,
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

  async generateOutletReport(req: Request, res: Response) {
    try {
      const { outletId, startDate, endDate, timeframe, reportType } = req.query;

      console.log("Report request:", {
        outletId,
        startDate,
        endDate,
        timeframe,
        reportType
      });

      const filters = {
        outletId: outletId ? (outletId === 'all' ? undefined : parseInt(outletId as string)) : undefined,
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
      console.error("Error in generateOutletReport controller:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async compareOutlets(req: Request, res: Response) {
    try {
      const { timeframe } = req.query;
      
      console.log(`Outlet comparison request with timeframe: ${timeframe}`);
  
      const comparisonData = await getOutletComparisonService(
        (timeframe as string || "monthly") as ReportTimeframe
      );
  
      res.status(200).json({
        success: true,
        data: comparisonData,
      });
    } catch (error: any) {
      console.error("Error in compareOutlets controller:", error);
      
      res.status(500).json({
        success: false,
        message: error.message || "An error occurred while comparing outlets",
      });
    }
  }

  async getTransactionTrends(req: Request, res: Response) {
    try {
      const { outletId, period, startDate, endDate } = req.query;

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