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
    try {
        const { outletId, startDate, endDate, timeframe = "daily", reportType = "comprehensive" } = filters;
        let dateStart = startDate;
        let dateEnd = endDate;
        // If dates aren't provided, calculate appropriate date ranges based on timeframe
        if (!startDate || !endDate) {
            const today = new Date();
            switch (timeframe) {
                case "daily":
                    // Use the last 30 days for daily view
                    dateStart = (0, date_fns_1.startOfDay)((0, date_fns_1.subDays)(today, 29)); // 30 days including today
                    dateEnd = (0, date_fns_1.endOfDay)(today);
                    break;
                case "weekly":
                    // Use the last 12 weeks for weekly view
                    dateStart = (0, date_fns_1.startOfDay)((0, date_fns_1.subWeeks)(today, 11)); // 12 weeks including current week
                    dateEnd = (0, date_fns_1.endOfDay)(today);
                    break;
                case "monthly":
                    // Use current year for monthly view
                    dateStart = (0, date_fns_1.startOfYear)(today);
                    dateEnd = (0, date_fns_1.endOfYear)(today);
                    break;
                case "yearly":
                    // Use last 5 years for yearly view
                    dateStart = (0, date_fns_1.startOfYear)(new Date(today.getFullYear() - 4, 0, 1));
                    dateEnd = (0, date_fns_1.endOfYear)(today);
                    break;
                case "custom":
                    // For custom timeframe with no dates, default to last 30 days
                    dateStart = (0, date_fns_1.startOfDay)((0, date_fns_1.subDays)(today, 29));
                    dateEnd = (0, date_fns_1.endOfDay)(today);
                    break;
                default:
                    dateStart = (0, date_fns_1.startOfDay)((0, date_fns_1.subDays)(today, 29));
                    dateEnd = (0, date_fns_1.endOfDay)(today);
            }
        }
        // Create base where clause
        const baseWhereClause = {
            createdAt: {
                gte: dateStart,
                lte: dateEnd,
            },
        };
        if (outletId) {
            baseWhereClause.outletId = outletId;
        }
        console.log(`Fetching data from ${dateStart} to ${dateEnd} with timeframe ${timeframe}`);
        let reportData = {};
        // Pass the timeframe to each metrics service so they can apply appropriate grouping
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
        console.error("Error in generateOutletReportService:", error);
        throw new Error(`Error generating outlet report: ${error.message}`);
    }
});
exports.generateOutletReportService = generateOutletReportService;
