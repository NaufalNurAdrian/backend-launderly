"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const getAnalitics_service_1 = require("../services/report/getAnalitics.service");
const getEmployeePerformance_service_1 = require("../services/report/getEmployeePerformance.service");
const getSalesReport_service_1 = require("../services/report/getSalesReport.service");
class ReportController {
    getEmployeePerformanceController(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { filterOutlet, filterMonth, filterYear } = req.query;
                const result = yield (0, getEmployeePerformance_service_1.getEmployeePerformanceService)({
                    filterOutlet: filterOutlet,
                    filterMonth: filterMonth,
                    filterYear: filterYear,
                    id: Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id),
                });
                res
                    .status(200)
                    .send({ message: "Successfully fetched employee performance", result });
            }
            catch (error) {
                res.status(500).send({
                    message: error.message || "Failed to get employee performance",
                });
            }
        });
    }
    getSalesReportController(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { filterOutlet, filterMonth, filterYear } = req.query;
                const result = yield (0, getSalesReport_service_1.getSalesReportService)({
                    filterOutlet: filterOutlet,
                    filterMonth: filterMonth,
                    filterYear: filterYear,
                    id: Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id),
                });
                res
                    .status(200)
                    .send({ message: "Successfully fetched sales report", result });
            }
            catch (error) {
                res
                    .status(500)
                    .send({ message: error.message || "Failed to get sales report" });
            }
        });
    }
    generateOutletReport(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { outletId, startDate, endDate, timeframe, reportType } = req.query;
                // Parse and validate inputs
                const filters = {
                    outletId: outletId ? parseInt(outletId) : undefined,
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : undefined,
                    timeframe: (timeframe || "daily"),
                    reportType: (reportType || "comprehensive"),
                };
                const reportData = yield (0, getAnalitics_service_1.generateOutletReportService)(filters);
                res.status(200).json({
                    success: true,
                    data: reportData,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            }
        });
    }
    compareOutlets(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { timeframe } = req.query;
                const comparisonData = yield (0, getAnalitics_service_1.getOutletComparisonService)((timeframe || "monthly"));
                res.status(200).json({
                    success: true,
                    data: comparisonData,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            }
        });
    }
    /**
     * Get transaction trends over time
     */
    getTransactionTrends(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { outletId, period, startDate, endDate } = req.query;
                // For trends, we need custom date handling to group by day/week/month
                const filters = {
                    outletId: outletId ? parseInt(outletId) : undefined,
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : undefined,
                    timeframe: "custom",
                    reportType: "revenue",
                };
                const reportData = yield (0, getAnalitics_service_1.generateOutletReportService)(filters);
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
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            }
        });
    }
    /**
     * Get customer analytics
     */
    getCustomerAnalytics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { outletId, timeframe } = req.query;
                const filters = {
                    outletId: outletId ? parseInt(outletId) : undefined,
                    timeframe: (timeframe || "monthly"),
                    reportType: "customers",
                };
                const reportData = yield (0, getAnalitics_service_1.generateOutletReportService)(filters);
                res.status(200).json({
                    success: true,
                    data: reportData.customers,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            }
        });
    }
}
exports.ReportController = ReportController;
