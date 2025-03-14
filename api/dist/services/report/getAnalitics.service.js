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
exports.generateOutletReportService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const date_fns_1 = require("date-fns");
const transactionMetrics_service_1 = require("./transactionMetrics.service");
const revenueMetrics_service_1 = require("./revenueMetrics.service");
const customerMetrics_service_1 = require("./customerMetrics.service");
const orderMetrics_service_1 = require("./orderMetrics.service");
const generateOutletReportService = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { requestedOutletId, startDate, endDate, timeframe = "daily", reportType = "comprehensive", userId } = filters;
        const existingUser = yield prisma_1.default.user.findFirst({
            where: { id: userId },
            select: {
                role: true,
                employee: {
                    select: {
                        outlet: { select: { id: true, outletName: true } }
                    }
                },
            },
        });
        if (!existingUser) {
            throw new Error("User not found!");
        }
        let effectiveOutletId = requestedOutletId;
        if (existingUser.role === "OUTLET_ADMIN") {
            if (!((_b = (_a = existingUser.employee) === null || _a === void 0 ? void 0 : _a.outlet) === null || _b === void 0 ? void 0 : _b.id)) {
                throw new Error("Outlet admin is not assigned to any outlet");
            }
            effectiveOutletId = existingUser.employee.outlet.id;
        }
        else if (existingUser.role === "SUPER_ADMIN") {
            console.log(`User is SUPER_ADMIN ${effectiveOutletId ? `- Filtering by outlet ID: ${effectiveOutletId}` : '- Viewing all outlets'}`);
        }
        else {
            if (!((_d = (_c = existingUser.employee) === null || _c === void 0 ? void 0 : _c.outlet) === null || _d === void 0 ? void 0 : _d.id)) {
                throw new Error("Employee is not assigned to any outlet");
            }
            effectiveOutletId = existingUser.employee.outlet.id;
        }
        let dateStart = startDate;
        let dateEnd = endDate;
        if ((!startDate || !endDate)) {
            if (timeframe === "custom") {
                throw new Error("Date range is required for custom time period");
            }
            const today = new Date();
            switch (timeframe) {
                case "daily":
                    dateStart = (0, date_fns_1.startOfDay)(today);
                    dateEnd = (0, date_fns_1.endOfDay)(today);
                    break;
                case "weekly":
                    dateStart = (0, date_fns_1.startOfDay)((0, date_fns_1.subDays)(today, 6));
                    dateEnd = (0, date_fns_1.endOfDay)(today);
                    break;
                case "monthly":
                    dateStart = (0, date_fns_1.startOfMonth)(today);
                    dateEnd = (0, date_fns_1.endOfMonth)(today);
                    break;
                case "yearly":
                    dateStart = (0, date_fns_1.startOfYear)(today);
                    dateEnd = (0, date_fns_1.endOfYear)(today);
                    break;
                default:
                    dateStart = (0, date_fns_1.startOfDay)((0, date_fns_1.subDays)(today, 29));
                    dateEnd = (0, date_fns_1.endOfDay)(today);
            }
        }
        if (!dateStart || !dateEnd) {
            const today = new Date();
            dateStart = (0, date_fns_1.startOfDay)(today);
            dateEnd = (0, date_fns_1.endOfDay)(today);
        }
        const baseWhereClause = {
            createdAt: {
                gte: dateStart,
                lte: dateEnd,
            },
        };
        if (effectiveOutletId) {
            baseWhereClause.outletId = effectiveOutletId;
        }
        console.log(`Fetching data from ${(0, date_fns_1.format)(dateStart, 'yyyy-MM-dd HH:mm:ss')} to ${(0, date_fns_1.format)(dateEnd, 'yyyy-MM-dd HH:mm:ss')} with timeframe ${timeframe}`);
        console.log(`Using outlet filter: ${effectiveOutletId || 'All outlets'}`);
        let reportData = {};
        if (reportType === "transactions" || reportType === "comprehensive") {
            const transactionMetrics = yield (0, transactionMetrics_service_1.getTransactionMetrics)(baseWhereClause, timeframe);
            reportData.transactions = transactionMetrics;
        }
        if (reportType === "revenue" || reportType === "comprehensive") {
            const revenueMetrics = yield (0, revenueMetrics_service_1.getRevenueMetrics)(baseWhereClause, timeframe);
            reportData.revenue = revenueMetrics;
        }
        if (reportType === "customers" || reportType === "comprehensive") {
            const customerMetrics = yield (0, customerMetrics_service_1.getCustomerMetrics)(baseWhereClause, timeframe);
            reportData.customers = customerMetrics;
        }
        if (reportType === "orders" || reportType === "comprehensive") {
            const orderMetrics = yield (0, orderMetrics_service_1.getOrderMetrics)(baseWhereClause, timeframe);
            reportData.orders = orderMetrics;
        }
        if (effectiveOutletId) {
            const outlet = yield prisma_1.default.outlet.findUnique({
                where: { id: effectiveOutletId },
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
            userRole: existingUser.role
        };
        return reportData;
    }
    catch (error) {
        console.error("Error in generateOutletReportService:", error);
        throw new Error(`Error generating outlet report: ${error.message}`);
    }
});
exports.generateOutletReportService = generateOutletReportService;
