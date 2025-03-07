"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportRouter = void 0;
const express_1 = require("express");
const verify_1 = require("../middlewares/verify");
const report_controller_1 = require("../controllers/report.controller");
class ReportRouter {
    constructor() {
        this.reportController = new report_controller_1.ReportController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/employee-performance", verify_1.verifyToken, verify_1.checkOutletSuper, this.reportController.getEmployeePerformanceController);
        this.router.get("/sales-report", verify_1.verifyToken, verify_1.checkOutletSuper, this.reportController.getSalesReportController);
        this.router.get("/generate", verify_1.verifyToken, verify_1.checkSuperAdmin, this.reportController.generateOutletReport.bind(this.reportController));
        this.router.get("/compare", verify_1.verifyToken, verify_1.checkSuperAdmin, this.reportController.compareOutlets.bind(this.reportController));
        this.router.get("/trends", verify_1.verifyToken, verify_1.checkSuperAdmin, this.reportController.getTransactionTrends.bind(this.reportController));
        this.router.get("/customers", verify_1.verifyToken, verify_1.checkSuperAdmin, this.reportController.getCustomerAnalytics.bind(this.reportController));
    }
    getRouter() {
        return this.router;
    }
}
exports.ReportRouter = ReportRouter;
