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
                const { filterOutlet, filterMonth, filterYear, timeframe, startDate, endDate } = req.query;
                console.log("Sales report request:", {
                    filterOutlet, filterMonth, filterYear, timeframe, startDate, endDate
                });
                const result = yield (0, getSalesReport_service_1.getSalesReportService)({
                    filterOutlet: filterOutlet,
                    filterMonth: filterMonth,
                    filterYear: filterYear,
                    timeframe: timeframe,
                    startDate: startDate,
                    endDate: endDate,
                    id: Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.id),
                });
                res
                    .status(200)
                    .send({ message: "Successfully fetched sales report", result });
            }
            catch (error) {
                console.error("Error in getSalesReportController:", error);
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
                console.error("Error in getEmployeePerformanceController:", error);
                res.status(500).send({
                    message: error.message || "Failed to get employee performance",
                });
            }
        });
    }
    generateOutletReport(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { outletId, startDate, endDate, timeframe, reportType } = req.query;
                console.log("Report API request:", {
                    outletId,
                    startDate,
                    endDate,
                    timeframe,
                    reportType
                });
                // Validate parameters for custom timeframe
                if (timeframe === 'custom' && (!startDate || !endDate)) {
                    res.status(400).json({
                        success: false,
                        message: "Date range is required for custom time period"
                    });
                }
                // Parse parameters with proper type conversion
                const filters = {
                    outletId: outletId ? (outletId === 'all' ? undefined : parseInt(outletId)) : undefined,
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : undefined,
                    timeframe: (timeframe || "daily"),
                    reportType: (reportType || "comprehensive"),
                };
                // Format dates with proper time components
                if (filters.startDate) {
                    filters.startDate.setHours(0, 0, 0, 0);
                }
                if (filters.endDate) {
                    filters.endDate.setHours(23, 59, 59, 999);
                }
                // Generate report with enhanced logging
                console.log(`Generating ${filters.reportType} report for ${filters.timeframe} timeframe`, {
                    startDate: (_a = filters.startDate) === null || _a === void 0 ? void 0 : _a.toISOString(),
                    endDate: (_b = filters.endDate) === null || _b === void 0 ? void 0 : _b.toISOString(),
                    outletId: filters.outletId
                });
                const reportData = yield (0, getAnalitics_service_1.generateOutletReportService)(filters);
                // Return response with success status
                res.status(200).json({
                    success: true,
                    data: reportData,
                });
            }
            catch (error) {
                console.error("Error in generateOutletReport controller:", error);
                // Provide detailed error message for troubleshooting
                res.status(500).json({
                    success: false,
                    message: error.message,
                    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
                });
            }
        });
    }
    compareOutlets(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { timeframe, startDate, endDate } = req.query;
                console.log(`Outlet comparison request:`, {
                    timeframe,
                    startDate,
                    endDate
                });
                // Parse timeframe
                const parsedTimeframe = (timeframe || "monthly");
                // Sesuaikan pemanggilan getOutletComparisonService dengan jumlah parameter yang benar
                // Error sebelumnya: Expected 0-1 arguments, but got 3
                const comparisonData = yield (0, getOutletComparisonService_1.getOutletComparisonService)(parsedTimeframe);
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
                // Parse parameters with proper validation
                const filters = {
                    outletId: outletId ? parseInt(outletId) : undefined,
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : undefined,
                    timeframe: "custom",
                    reportType: "revenue",
                };
                // Format dates with proper time components
                if (filters.startDate) {
                    filters.startDate.setHours(0, 0, 0, 0);
                }
                if (filters.endDate) {
                    filters.endDate.setHours(23, 59, 59, 999);
                }
                const reportData = yield (0, getAnalitics_service_1.generateOutletReportService)(filters);
                // Extract trends data from report
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
                console.error("Error in getTransactionTrends controller:", error);
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
                const { outletId, timeframe, startDate, endDate } = req.query;
                // Parse parameters with proper validation
                const filters = {
                    outletId: outletId ? parseInt(outletId) : undefined,
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : undefined,
                    timeframe: (timeframe || "monthly"),
                    reportType: "customers",
                };
                // Format dates with proper time components
                if (filters.startDate) {
                    filters.startDate.setHours(0, 0, 0, 0);
                }
                if (filters.endDate) {
                    filters.endDate.setHours(23, 59, 59, 999);
                }
                const reportData = yield (0, getAnalitics_service_1.generateOutletReportService)(filters);
                res.status(200).json({
                    success: true,
                    data: reportData.customers,
                });
            }
            catch (error) {
                console.error("Error in getCustomerAnalytics controller:", error);
                res.status(500).json({
                    success: false,
                    message: error.message,
                });
            }
        });
    }
}
exports.ReportController = ReportController;
