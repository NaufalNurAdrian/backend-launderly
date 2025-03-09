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
exports.getSalesReportService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const date_fns_1 = require("date-fns");
const getSalesReportService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id, filterOutlet, filterMonth, filterYear } = query;
        const existingUser = yield prisma_1.default.user.findFirst({
            where: { id },
            select: {
                employee: { select: { outlet: { select: { id: true } } } },
                role: true,
            },
        });
        if (!existingUser)
            throw new Error("User not found!");
        const whereClause = {
            paymentStatus: "SUCCESSED",
        };
        if (existingUser.role !== "SUPER_ADMIN") {
            whereClause.order = {
                pickupOrder: { outletId: (_b = (_a = existingUser.employee) === null || _a === void 0 ? void 0 : _a.outlet) === null || _b === void 0 ? void 0 : _b.id },
            };
        }
        else if (filterOutlet !== "all") {
            whereClause.order = {
                pickupOrder: { outletId: Number(filterOutlet) },
            };
        }
        const orders = yield prisma_1.default.order.findMany({
            where: whereClause.order,
        });
        let totalOrders = orders.length;
        let receivedAtOutlet = orders.filter(order => order.orderStatus === "ARRIVED_AT_OUTLET").length;
        let onProgress = orders.filter(order => ["READY_FOR_WASHING", "BEING_WASHED", "WASHING_COMPLETED", "BEING_IRONED", "IRONING_COMPLETED", "BEING_PACKED"].includes(order.orderStatus)).length;
        let completed = orders.filter(order => order.orderStatus === "COMPLETED").length;
        const now = new Date();
        const month = filterMonth ? Number(filterMonth) - 1 : now.getMonth();
        const year = filterYear ? Number(filterYear) : now.getFullYear();
        const startDate = (0, date_fns_1.startOfMonth)(new Date(year, month));
        const endDate = (0, date_fns_1.endOfMonth)(new Date(year, month));
        whereClause.updatedAt = { gte: startDate, lte: endDate };
        const payments = yield prisma_1.default.payment.findMany({
            where: whereClause,
            include: { order: true },
        });
        let totalIncome = 0;
        let totalTransaction = 0;
        let totalWeight = 0;
        const daysInMonth = (0, date_fns_1.getDaysInMonth)(new Date(year, month));
        const incomeDaily = new Array(daysInMonth).fill(0);
        const transactionDaily = new Array(daysInMonth).fill(0);
        const weightDaily = new Array(daysInMonth).fill(0);
        payments.forEach((payment) => {
            var _a, _b, _c, _d;
            totalIncome += payment.amount;
            totalTransaction += 1;
            totalWeight += (_b = (_a = payment.order) === null || _a === void 0 ? void 0 : _a.weight) !== null && _b !== void 0 ? _b : 0;
            const dayIndex = new Date(payment.updatedAt).getDate() - 1;
            incomeDaily[dayIndex] += payment.amount;
            transactionDaily[dayIndex] += 1;
            weightDaily[dayIndex] += (_d = (_c = payment.order) === null || _c === void 0 ? void 0 : _c.weight) !== null && _d !== void 0 ? _d : 0;
        });
        const incomeMonthly = new Array(12).fill(0);
        const transactionMonthly = new Array(12).fill(0);
        const weightMonthly = new Array(12).fill(0);
        const currentYear = new Date().getFullYear();
        const pastYears = Array.from({ length: 5 }, (_, i) => currentYear - i).reverse();
        const incomeYearly = new Array(5).fill(0);
        const transactionYearly = new Array(5).fill(0);
        const weightYearly = new Array(5).fill(0);
        for (let i = 0; i < 12; i++) {
            const monthStart = (0, date_fns_1.startOfMonth)(new Date(year, i));
            const monthEnd = (0, date_fns_1.endOfMonth)(new Date(year, i));
            const monthlyPayments = yield prisma_1.default.payment.findMany({
                where: Object.assign(Object.assign({}, whereClause), { updatedAt: { gte: monthStart, lte: monthEnd } }),
                include: { order: true },
            });
            monthlyPayments.forEach((payment) => {
                var _a, _b;
                incomeMonthly[i] += payment.amount;
                transactionMonthly[i] += 1;
                weightMonthly[i] += (_b = (_a = payment.order) === null || _a === void 0 ? void 0 : _a.weight) !== null && _b !== void 0 ? _b : 0;
            });
        }
        for (let i = 0; i < pastYears.length; i++) {
            const yearStart = (0, date_fns_1.startOfYear)(new Date(pastYears[i], 0, 1));
            const yearEnd = (0, date_fns_1.endOfYear)(new Date(pastYears[i], 11, 31));
            const yearlyPayments = yield prisma_1.default.payment.findMany({
                where: Object.assign(Object.assign({}, whereClause), { updatedAt: { gte: yearStart, lte: yearEnd } }),
                include: { order: true },
            });
            yearlyPayments.forEach((payment) => {
                var _a, _b;
                incomeYearly[i] += payment.amount;
                transactionYearly[i] += 1;
                weightYearly[i] += (_b = (_a = payment.order) === null || _a === void 0 ? void 0 : _a.weight) !== null && _b !== void 0 ? _b : 0;
            });
        }
        return {
            message: "Successfully fetched sales report",
            result: {
                totalIncome,
                totalTransaction,
                totalOrders,
                receivedAtOutlet,
                onProgress,
                completed,
                totalWeight,
                incomeDaily,
                transactionDaily,
                weightDaily,
                incomeMonthly,
                transactionMonthly,
                weightMonthly,
                pastYears,
                incomeYearly,
                transactionYearly,
                weightYearly,
            },
        };
    }
    catch (error) {
        throw error;
    }
});
exports.getSalesReportService = getSalesReportService;
