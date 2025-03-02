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
}
