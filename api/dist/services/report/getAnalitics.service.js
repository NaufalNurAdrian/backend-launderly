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
/**
 * Generate transaction reports for outlets
 */
const generateOutletReportService = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { outletId, startDate, endDate, timeframe = "daily", reportType = "comprehensive" } = filters;
        // Set date range based on timeframe
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
        // Base query filters
        const baseWhereClause = {
            createdAt: {
                gte: dateStart,
                lte: dateEnd,
            },
        };
        // Add outlet filter if specified
        if (outletId) {
            baseWhereClause.outletId = outletId;
        }
        // Generate report based on type
        let reportData = {};
        // Transaction metrics
        if (reportType === "transactions" || reportType === "comprehensive") {
            const transactionMetrics = yield getTransactionMetrics(baseWhereClause);
            reportData.transactions = transactionMetrics;
        }
        // Revenue metrics
        if (reportType === "revenue" || reportType === "comprehensive") {
            const revenueMetrics = yield getRevenueMetrics(baseWhereClause);
            reportData.revenue = revenueMetrics;
        }
        // Customer metrics
        if (reportType === "customers" || reportType === "comprehensive") {
            const customerMetrics = yield getCustomerMetrics(baseWhereClause);
            reportData.customers = customerMetrics;
        }
        // Order metrics
        if (reportType === "orders" || reportType === "comprehensive") {
            const orderMetrics = yield getOrderMetrics(baseWhereClause);
            reportData.orders = orderMetrics;
        }
        // Get outlet details if outlet-specific report
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
        // Add report metadata
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
/**
 * Get outlet performance comparison
 */
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
        // Get all outlets
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
        // Get performance data for each outlet
        const outletPerformance = yield Promise.all(outlets.map((outlet) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            // Pass parameters explicitly rather than using shorthand
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
// Implement the helper functions below
function getTransactionMetrics(baseWhereClause) {
    return __awaiter(this, void 0, void 0, function* () {
        // Implementation here...
        // Placeholder to make the code compile
        return {
            count: {
                successful: 0,
                pending: 0,
                failed: 0,
                total: 0
            },
            conversionRate: 0,
            paymentMethods: [],
            averageValue: 0,
            highestValue: 0,
            lowestValue: 0
        };
    });
}
function getRevenueMetrics(baseWhereClause) {
    return __awaiter(this, void 0, void 0, function* () {
        // Implementation here...
        // Placeholder to make the code compile
        return {
            total: 0,
            breakdown: {
                laundry: 0,
                pickup: 0,
                delivery: 0
            },
            daily: []
        };
    });
}
function getCustomerMetrics(baseWhereClause) {
    return __awaiter(this, void 0, void 0, function* () {
        // Implementation here...
        // Placeholder to make the code compile
        return {
            active: 0,
            new: 0,
            returning: 0,
            topCustomers: []
        };
    });
}
function getOrderMetrics(baseWhereClause) {
    return __awaiter(this, void 0, void 0, function* () {
        // Implementation here...
        // Placeholder to make the code compile
        return {
            byStatus: [],
            avgProcessingTimeHours: 0,
            popularItems: []
        };
    });
}
