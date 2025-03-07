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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOutletComparisonService = exports.generateOutletReportService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const date_fns_1 = require("date-fns");
const transactionMetrics_service_1 = require("./transactionMetrics.service");
const revenueMetrics_service_1 = require("./revenueMetrics.service");
const customerMetrics_service_1 = require("./customerMetrics.service");
const orderMetrics_service_1 = require("./orderMetrics.service");
const generateOutletReportService = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { outletId, startDate, endDate, timeframe = "daily", reportType = "comprehensive" } = filters;
        let dateStart = startDate;
        let dateEnd = endDate;
        if (!startDate || !endDate) {
            const today = new Date();
            switch (timeframe) {
                case "daily":
                    dateStart = (0, date_fns_1.startOfDay)(today);
                    dateEnd = (0, date_fns_1.endOfDay)(today);
                    break;
                case "weekly":
                    dateStart = (0, date_fns_1.startOfWeek)(today);
                    dateEnd = (0, date_fns_1.endOfWeek)(today);
                    break;
                case "monthly":
                    dateStart = (0, date_fns_1.startOfMonth)(today);
                    dateEnd = (0, date_fns_1.endOfMonth)(today);
                    break;
                default:
                    dateStart = (0, date_fns_1.startOfDay)(today);
                    dateEnd = (0, date_fns_1.endOfDay)(today);
            }
        }
        const baseWhereClause = {
            createdAt: {
                gte: dateStart,
                lte: dateEnd,
            },
        };
        if (outletId) {
            baseWhereClause.outletId = outletId;
        }
        let reportData = {};
        if (reportType === "transactions" || reportType === "comprehensive") {
            const transactionMetrics = yield (0, transactionMetrics_service_1.getTransactionMetrics)(baseWhereClause);
            reportData.transactions = transactionMetrics;
        }
        if (reportType === "revenue" || reportType === "comprehensive") {
            const revenueMetrics = yield (0, revenueMetrics_service_1.getRevenueMetrics)(baseWhereClause);
            reportData.revenue = revenueMetrics;
        }
        if (reportType === "customers" || reportType === "comprehensive") {
            const customerMetrics = yield (0, customerMetrics_service_1.getCustomerMetrics)(baseWhereClause);
            reportData.customers = customerMetrics;
        }
        if (reportType === "orders" || reportType === "comprehensive") {
            const orderMetrics = yield (0, orderMetrics_service_1.getOrderMetrics)(baseWhereClause);
            reportData.orders = orderMetrics;
        }
        if (outletId) {
            const outlet = yield prisma_1.default.outlet.findUnique({
                where: { id: outletId },
                select: {
                    id: true,
                    outletName: true,
                    outletType: true,
                },
            });
            reportData.outletDetails = outlet;
        }
        reportData.metadata = {
            generatedAt: new Date(),
            timeframe,
            dateRange: {
                from: dateStart,
                to: dateEnd,
            },
        };
        return reportData;
    }
    catch (error) {
        throw new Error(`Error generating outlet report: ${error.message}`);
    }
});
exports.generateOutletReportService = generateOutletReportService;
const getOutletComparisonService = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (timeframe = "monthly") {
    try {
        const today = new Date();
        let dateStart;
        let dateEnd = (0, date_fns_1.endOfDay)(today);
        switch (timeframe) {
            case "daily":
                dateStart = (0, date_fns_1.startOfDay)(today);
                break;
            case "weekly":
                dateStart = (0, date_fns_1.startOfWeek)(today);
                break;
            case "monthly":
                dateStart = (0, date_fns_1.startOfMonth)(today);
                break;
            default:
                dateStart = (0, date_fns_1.startOfMonth)(today);
        }
        const outlets = yield prisma_1.default.outlet.findMany({
            where: {
                isDelete: false,
            },
            select: {
                id: true,
                outletName: true,
                outletType: true,
            },
        });
        const outletPerformance = yield Promise.all(outlets.map((outlet) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const reportData = yield (0, exports.generateOutletReportService)({
                outletId: outlet.id,
                startDate: dateStart,
                endDate: dateEnd,
                timeframe: timeframe,
                reportType: "comprehensive",
            });
            return {
                id: outlet.id,
                name: outlet.outletName,
                type: outlet.outletType,
                revenue: reportData.revenue.total,
                orders: ((_a = reportData.orders) === null || _a === void 0 ? void 0 : _a.byStatus.reduce((sum, status) => sum + status._count, 0)) || 0,
                customers: ((_b = reportData.customers) === null || _b === void 0 ? void 0 : _b.active) || 0,
            };
        })));
        return {
            outlets: outletPerformance,
            timeframe,
            dateRange: {
                from: dateStart,
                to: dateEnd,
            },
        };
    }
    catch (error) {
        throw new Error(`Error generating outlet comparison: ${error.message}`);
    }
});
exports.getOutletComparisonService = getOutletComparisonService;
