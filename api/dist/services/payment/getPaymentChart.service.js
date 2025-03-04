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
exports.getPaymentChartService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const date_fns_1 = require("date-fns");
const getPaymentChartService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id, filterMonth, filterOutlet, filterYear } = query;
        const existingUser = yield prisma_1.default.user.findFirst({
            where: { id: id },
            select: {
                employee: { select: { outlet: { select: { id: true } } } },
                role: true,
            },
        });
        if (!existingUser) {
            throw new Error("User not Found!");
        }
        const whereClause = {
            paymentStatus: "SUCCESSED",
        };
        if (existingUser.role != "SUPER_ADMIN") {
            const pickupOrders = yield prisma_1.default.pickupOrder.findMany({
                where: { outletId: (_b = (_a = existingUser.employee) === null || _a === void 0 ? void 0 : _a.outlet) === null || _b === void 0 ? void 0 : _b.id },
                select: { id: true },
            });
            const pickupOrderIds = pickupOrders.map((pickup) => pickup.id);
            const orders = yield prisma_1.default.order.findMany({
                where: { pickupOrderId: { in: pickupOrderIds } },
                select: { id: true },
            });
            const orderIds = orders.map((order) => order.id);
            whereClause.orderId = { in: orderIds };
        }
        else {
            if (filterOutlet != "all") {
                const pickupOrders = yield prisma_1.default.pickupOrder.findMany({
                    where: { outletId: Number(filterOutlet) },
                    select: { id: true },
                });
                const pickupOrderIds = pickupOrders.map((pickup) => pickup.id);
                const orders = yield prisma_1.default.order.findMany({
                    where: { pickupOrderId: { in: pickupOrderIds } },
                    select: { id: true },
                });
                const orderIds = orders.map((order) => order.id);
                whereClause.orderId = { in: orderIds };
            }
        }
        const now = new Date();
        const month = filterMonth ? Number(filterMonth) - 1 : now.getMonth();
        const year = filterYear ? Number(filterYear) : now.getFullYear();
        function getDaysInSpecificMonth(year, month) {
            const date = new Date(year, month);
            return (0, date_fns_1.getDaysInMonth)(date);
        }
        const daysInMonth = getDaysInSpecificMonth(year, month);
        const incomeDaily = [];
        const transactionDaily = [];
        const weightDaily = [];
        const fetchDailyData = () => __awaiter(void 0, void 0, void 0, function* () {
            for (let i = 1; i <= daysInMonth; i++) {
                const day = new Date(year, month, i);
                const startOfDay = new Date(day.setHours(0, 0, 0, 0));
                const endOfDay = new Date(day.setHours(23, 59, 59, 999));
                const dailyWhereClause = Object.assign(Object.assign({}, whereClause), { updatedAt: {
                        gte: startOfDay,
                        lt: endOfDay,
                    } });
                const dailyPayments = yield prisma_1.default.payment.findMany({
                    where: dailyWhereClause,
                    include: { order: true },
                });
                let totalIncome = 0;
                let totalTransaction = 0;
                let totalWeight = 0;
                dailyPayments.forEach((payment) => {
                    var _a, _b;
                    totalIncome += payment.amount;
                    totalTransaction += 1;
                    totalWeight += (_b = (_a = payment.order) === null || _a === void 0 ? void 0 : _a.weight) !== null && _b !== void 0 ? _b : 0;
                });
                incomeDaily.push(Number(totalIncome));
                transactionDaily.push(Number(totalTransaction));
                weightDaily.push(Number(totalWeight));
            }
        });
        yield fetchDailyData();
        const incomeMonthly = [];
        const transactionMonthly = [];
        const weightMonthly = [];
        const monthTypes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        const fetchMonthlyData = () => __awaiter(void 0, void 0, void 0, function* () {
            for (const monthType of monthTypes) {
                const startDate = new Date(year, monthType - 1, 1);
                const endDate = (0, date_fns_1.endOfMonth)(startDate);
                const monthlyWhereClause = Object.assign(Object.assign({}, whereClause), { updatedAt: {
                        gte: startDate,
                        lt: endDate,
                    } });
                const monthlyPayments = yield prisma_1.default.payment.findMany({
                    where: monthlyWhereClause,
                    include: { order: true },
                });
                let totalIncome = 0;
                let totalTransaction = 0;
                let totalWeight = 0;
                monthlyPayments.forEach((payment) => {
                    var _a, _b;
                    totalIncome += payment.amount;
                    totalTransaction += 1;
                    totalWeight += (_b = (_a = payment.order) === null || _a === void 0 ? void 0 : _a.weight) !== null && _b !== void 0 ? _b : 0;
                });
                incomeMonthly.push(Number(totalIncome));
                transactionMonthly.push(Number(totalTransaction));
                weightMonthly.push(Number(totalWeight));
            }
        });
        yield fetchMonthlyData();
        const startDate = new Date(year, month, 1);
        const endDate = (0, date_fns_1.endOfMonth)(startDate);
        whereClause.updatedAt = {
            gte: startDate,
            lt: endDate,
        };
        const payments = yield prisma_1.default.payment.findMany({
            where: whereClause,
            include: { order: true },
        });
        let totalIncome = 0;
        let totalTransaction = 0;
        let totalWeight = 0;
        payments.forEach((payment) => {
            var _a, _b;
            totalIncome += payment.amount;
            totalTransaction += 1;
            totalWeight += (_b = (_a = payment.order) === null || _a === void 0 ? void 0 : _a.weight) !== null && _b !== void 0 ? _b : 0;
        });
        return {
            data: {
                totalIncome: totalIncome,
                totalTransaction: totalTransaction,
                totalWeight: totalWeight,
                incomeMonthly: incomeMonthly,
                transactionMonthly: transactionMonthly,
                weightMonthly: weightMonthly,
                incomeDaily: incomeDaily,
                transactionDaily: transactionDaily,
                weightDaily: weightDaily,
            },
        };
    }
    catch (error) {
        throw error;
    }
});
exports.getPaymentChartService = getPaymentChartService;
