import { Router } from "express";
import { checkOutletSuper, checkSuperAdmin, verifyToken } from "../middlewares/verify";
import { ReportController } from "../controllers/report.controller";

export class ReportRouter {
  private reportController: ReportController;
  private router: Router;

  constructor() {
    this.reportController = new ReportController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      "/employee-performance",
      verifyToken,
      checkOutletSuper,
      this.reportController.getEmployeePerformanceController
    );
    this.router.get(
      "/sales-report",
      verifyToken,
      checkOutletSuper,
      this.reportController.getSalesReportController
    );
    this.router.get(
      "/generate", 
      verifyToken, 
      checkSuperAdmin, 
      this.reportController.generateOutletReport.bind(this.reportController)
    );
    this.router.get(
      "/compare", 
      verifyToken, 
      checkSuperAdmin, 
      this.reportController.compareOutlets.bind(this.reportController)
    );
    this.router.get(
      "/trends", 
      verifyToken, 
      checkSuperAdmin, 
      this.reportController.getTransactionTrends.bind(this.reportController)
    );
    this.router.get(
      "/customers", 
      verifyToken, 
      checkSuperAdmin, 
      this.reportController.getCustomerAnalytics.bind(this.reportController)
    );
  }
  

  getRouter() {
    return this.router;
  }
}
