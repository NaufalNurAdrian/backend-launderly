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
            var _a, _b;
            try {
                const { filterOutlet, filterMonth, filterYear, timeframe, startDate, endDate } = req.query;
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                    res.status(401).send({
                        message: "Unauthorized. User not authenticated properly."
                    });
                }
                const result = yield (0, getSalesReport_service_1.getSalesReportService)({
                    filterOutlet: filterOutlet,
                    filterMonth: filterMonth,
                    filterYear: filterYear,
                    timeframe: timeframe,
                    startDate: startDate,
                    endDate: endDate,
                    id: Number((_b = req.user) === null || _b === void 0 ? void 0 : _b.id),
                });
                res
                    .status(200)
                    .send({ message: "Successfully fetched sales report", result });
            }
            catch (error) {
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
        });
    }
    getEmployeePerformanceController(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { filterOutlet, filterMonth, filterYear } = req.query;
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                    res.status(401).send({
                        message: "Unauthorized. User not authenticated properly."
                    });
                }
                const result = yield (0, getEmployeePerformance_service_1.getEmployeePerformanceService)({
                    filterOutlet: filterOutlet,
                    filterMonth: filterMonth,
                    filterYear: filterYear,
                    id: Number((_b = req.user) === null || _b === void 0 ? void 0 : _b.id),
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
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
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
                    requestedOutletId: outletId ? (outletId === 'all' ? undefined : parseInt(outletId)) : undefined,
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : undefined,
                    timeframe: (timeframe || "daily"),
                    reportType: (reportType || "comprehensive"),
                    userId: Number((_b = req.user) === null || _b === void 0 ? void 0 : _b.id)
                };
                if (parsedFilters.startDate) {
                    parsedFilters.startDate.setHours(0, 0, 0, 0);
                }
                if (parsedFilters.endDate) {
                    parsedFilters.endDate.setHours(23, 59, 59, 999);
                }
                const reportData = yield (0, getAnalitics_service_1.generateOutletReportService)(parsedFilters);
                res.status(200).json({
                    success: true,
                    data: reportData,
                });
            }
            catch (error) {
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
        });
    }
    compareOutlets(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { timeframe, startDate, endDate } = req.query;
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
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
                const parsedTimeframe = (timeframe || "monthly");
                const comparisonData = yield (0, getOutletComparisonService_1.getOutletComparisonService)(parsedTimeframe, startDate, endDate);
                res.status(200).json({
                    success: true,
                    data: comparisonData,
                });
            }
            catch (error) {
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
        });
    }
    getTransactionTrends(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { outletId, period, startDate, endDate } = req.query;
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                    res.status(401).json({
                        success: false,
                        message: "Unauthorized. User not authenticated properly."
                    });
                }
                const filters = {
                    requestedOutletId: outletId ? parseInt(outletId) : undefined,
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : undefined,
                    timeframe: "custom",
                    reportType: "revenue",
                    userId: Number((_b = req.user) === null || _b === void 0 ? void 0 : _b.id)
                };
                if (filters.startDate) {
                    filters.startDate.setHours(0, 0, 0, 0);
                }
                if (filters.endDate) {
                    filters.endDate.setHours(23, 59, 59, 999);
                }
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
        });
    }
    getCustomerAnalytics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { outletId, timeframe, startDate, endDate } = req.query;
                if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.id)) {
                    res.status(401).json({
                        success: false,
                        message: "Unauthorized. User not authenticated properly."
                    });
                }
                const filters = {
                    requestedOutletId: outletId ? parseInt(outletId) : undefined,
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : undefined,
                    timeframe: (timeframe || "monthly"),
                    reportType: "customers",
                    userId: Number((_b = req.user) === null || _b === void 0 ? void 0 : _b.id)
                };
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
        });
    }
}
exports.ReportController = ReportController;
