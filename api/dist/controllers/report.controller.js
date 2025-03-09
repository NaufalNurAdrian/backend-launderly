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
const getSalesReport_service_1 = require("../services/report/getSalesReport.service");
const getEmployeePerformance_service_1 = require("../services/report/getEmployeePerformance.service");
const getAnalitics_service_1 = require("../services/report/getAnalitics.service");
const getOutletComparisonService_1 = require("../services/report/getOutletComparisonService");
class ReportController {
    getSalesReportController(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { filterOutlet, filterMonth, filterYear, timeframe } = req.query;
                const result = yield (0, getSalesReport_service_1.getSalesReportService)({
                    filterOutlet: filterOutlet,
                    filterMonth: filterMonth,
                    filterYear: filterYear,
                    timeframe: timeframe,
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
    generateOutletReport(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                    outletId: outletId ? (outletId === 'all' ? undefined : parseInt(outletId)) : undefined,
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
                console.error("Error in generateOutletReport controller:", error);
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
                console.log(`Outlet comparison request with timeframe: ${timeframe}`);
                const comparisonData = yield (0, getOutletComparisonService_1.getOutletComparisonService)((timeframe || "monthly"));
                res.status(200).json({
                    success: true,
                    data: comparisonData,
                });
            }
            catch (error) {
                console.error("Error in compareOutlets controller:", error);
                res.status(500).json({
                    success: false,
                    message: error.message || "An error occurred while comparing outlets",
                });
            }
        });
    }
    getTransactionTrends(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { outletId, period, startDate, endDate } = req.query;
                const filters = {
                    outletId: outletId ? parseInt(outletId) : undefined,
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : undefined,
                    timeframe: "custom",
                    reportType: "revenue",
                };
                const reportData = yield (0, getAnalitics_service_1.generateOutletReportService)(filters);
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
