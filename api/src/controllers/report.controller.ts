import { Request, Response } from "express";
import { getSalesReportService } from "../services/report/getSalesReport.service";
import { getEmployeePerformanceService } from "../services/report/getEmployeePerformance.service";
import { generateOutletReportService } from "../services/report/getAnalitics.service";
import { getOutletComparisonService } from "../services/report/getOutletComparisonService";
import { ReportTimeframe } from "@/types/report";

export class ReportController {
  async getSalesReportController(req: Request, res: Response) {
    try {
      const { filterOutlet, filterMonth, filterYear, timeframe, startDate, endDate } = req.query;
      
      if (!req.user?.id) {
       res.status(401).send({ 
          message: "Unauthorized. User not authenticated properly." 
        });
      }
      
      const result = await getSalesReportService({
        filterOutlet: filterOutlet as string,
        filterMonth: filterMonth as string,
        filterYear: filterYear as string,
        timeframe: timeframe as "daily" | "weekly" | "monthly" | "custom" | undefined,
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
        id: Number(req.user?.id),
      });
      
      res
        .status(200)
        .send({ message: "Successfully fetched sales report", result });
    } catch (error: any) {
      console.error("Error in getSalesReportController:", error);
      
      if (error.message.includes("not assigned to any outlet")) {
        res.status(400).send({ 
          message: "You are not assigned to any outlet. Please contact an administrator." 
        });
      }
      
      res
        .status(500)
        .send({ message: error.message || "Failed to get sales report" });
    }
  }

  async getEmployeePerformanceController(req: Request, res: Response) {
    try {
      const { filterOutlet, filterMonth, filterYear } = req.query;
      
      if (!req.user?.id) {
       res.status(401).send({ 
          message: "Unauthorized. User not authenticated properly." 
        });
      }
      
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
      console.error("Error in getEmployeePerformanceController:", error);
      res.status(500).send({
        message: error.message || "Failed to get employee performance",
      });
    }
  }

  async generateOutletReport(req: Request, res: Response) {
    try {
      const { outletId, startDate, endDate, timeframe, reportType } = req.query;

      if (!req.user?.id) {
       res.status(401).json({
          success: false,
          message: "Unauthorized. User not authenticated properly."
        });
      }

      if (timeframe === 'custom' && (!startDate || !endDate)) {
       res.status(400).json({
          success: false,
          message: "Date range is required for custom time period"
        });
      }

      const parsedFilters = {
        requestedOutletId: outletId ? (outletId === 'all' ? undefined : parseInt(outletId as string)) : undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        timeframe: ((timeframe as string) || "daily") as ReportTimeframe,
        reportType: ((reportType as string) || "comprehensive") as
          | "transactions"
          | "revenue"
          | "customers"
          | "orders"
          | "comprehensive",
        userId: Number(req.user?.id)
      };

      if (parsedFilters.startDate) {
        parsedFilters.startDate.setHours(0, 0, 0, 0);
      }
      
      if (parsedFilters.endDate) {
        parsedFilters.endDate.setHours(23, 59, 59, 999);
      }
      
      const reportData = await generateOutletReportService(parsedFilters);

      res.status(200).json({
        success: true,
        data: reportData,
      });
    } catch (error: any) {
      console.error("Error in generateOutletReport controller:", error);
      
      if (error.message.includes("not assigned to any outlet")) {
       res.status(400).json({
          success: false,
          message: "You are not assigned to any outlet. Please contact an administrator."
        });
      }
      
      res.status(500).json({
        success: false,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  async compareOutlets(req: Request, res: Response) {
    try {
      const { timeframe, startDate, endDate } = req.query;
      
      if (!req.user?.id) {
        res.status(401).json({
          success: false,
          message: "Unauthorized. User not authenticated properly."
        });
      }
      
      console.log(`Outlet comparison request:`, {
        timeframe,
        startDate,
        endDate
      });
      
      if (timeframe === 'custom' && (!startDate || !endDate)) {
        res.status(400).json({
          success: false,
          message: "Start date and end date are required for custom timeframe"
        });
      }
      
      const parsedTimeframe = (timeframe as string || "monthly") as ReportTimeframe;
      
      const comparisonData = await getOutletComparisonService(
        parsedTimeframe,
        startDate as string,
        endDate as string
      );
    
      res.status(200).json({
        success: true,
        data: comparisonData,
      });
    } catch (error: any) {
      console.error("Error in compareOutlets controller:", error);
      
      if (error.message.includes("Only super admins")) {
        res.status(403).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: error.message || "An error occurred while comparing outlets",
      });
    }
  }

  async getTransactionTrends(req: Request, res: Response) {
    try {
      const { outletId, period, startDate, endDate } = req.query;

      if (!req.user?.id) {
       res.status(401).json({
          success: false,
          message: "Unauthorized. User not authenticated properly."
        });
      }

      const filters = {
        requestedOutletId: outletId ? parseInt(outletId as string) : undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        timeframe: "custom" as "daily" | "weekly" | "monthly" | "custom",
        reportType: "revenue" as
          | "transactions"
          | "revenue"
          | "customers"
          | "orders"
          | "comprehensive",
        userId: Number(req.user?.id)
      };

      if (filters.startDate) {
        filters.startDate.setHours(0, 0, 0, 0);
      }
      
      if (filters.endDate) {
        filters.endDate.setHours(23, 59, 59, 999);
      }

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
      console.error("Error in getTransactionTrends controller:", error);
      if (error.message.includes("not assigned to any outlet")) {
       res.status(400).json({
          success: false,
          message: "You are not assigned to any outlet. Please contact an administrator."
        });
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getCustomerAnalytics(req: Request, res: Response) {
    try {
      const { outletId, timeframe, startDate, endDate } = req.query;

      if (!req.user?.id) {
       res.status(401).json({
          success: false,
          message: "Unauthorized. User not authenticated properly."
        });
      }

      const filters = {
        requestedOutletId: outletId ? parseInt(outletId as string) : undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
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
        userId: Number(req.user?.id)
      };

      if (filters.startDate) {
        filters.startDate.setHours(0, 0, 0, 0);
      }
      
      if (filters.endDate) {
        filters.endDate.setHours(23, 59, 59, 999);
      }

      const reportData = await generateOutletReportService(filters);

      res.status(200).json({
        success: true,
        data: reportData.customers,
      });
    } catch (error: any) {
      console.error("Error in getCustomerAnalytics controller:", error);
      if (error.message.includes("not assigned to any outlet")) {
       res.status(400).json({
          success: false,
          message: "You are not assigned to any outlet. Please contact an administrator."
        });
      }
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}