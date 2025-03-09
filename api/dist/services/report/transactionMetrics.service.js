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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionMetrics = getTransactionMetrics;
const prisma_1 = __importDefault(require("../../prisma"));
const date_fns_1 = require("date-fns");
function getTransactionMetrics(baseWhereClause_1) {
    return __awaiter(this, arguments, void 0, function* (baseWhereClause, timeframe = "daily") {
        try {
            console.log(`Transaction metrics where clause (timeframe: ${timeframe}):`, JSON.stringify(baseWhereClause, null, 2));
            const { outletId } = baseWhereClause, otherWhereClause = __rest(baseWhereClause, ["outletId"]);
            const whereClause = Object.assign(Object.assign({}, otherWhereClause), { order: outletId ? {
                    pickupOrder: {
                        outletId: outletId
                    }
                } : undefined });
            const payments = yield prisma_1.default.payment.findMany({
                where: whereClause,
                include: {
                    order: {
                        include: {
                            pickupOrder: true
                        }
                    }
                }
            });
            // Determine current period based on timeframe for "right now" calculations
            const now = new Date();
            let currentPeriodStart;
            let currentPeriodEnd;
            switch (timeframe) {
                case "daily":
                    currentPeriodStart = (0, date_fns_1.startOfDay)(now);
                    currentPeriodEnd = (0, date_fns_1.endOfDay)(now);
                    break;
                case "weekly":
                    currentPeriodStart = (0, date_fns_1.startOfWeek)(now, { weekStartsOn: 1 }); // Week starts on Monday
                    currentPeriodEnd = (0, date_fns_1.endOfWeek)(now, { weekStartsOn: 1 });
                    break;
                case "monthly":
                    currentPeriodStart = (0, date_fns_1.startOfMonth)(now);
                    currentPeriodEnd = (0, date_fns_1.endOfMonth)(now);
                    break;
                case "yearly":
                    currentPeriodStart = (0, date_fns_1.startOfYear)(now);
                    currentPeriodEnd = (0, date_fns_1.endOfYear)(now);
                    break;
                default:
                    currentPeriodStart = (0, date_fns_1.startOfDay)(now);
                    currentPeriodEnd = (0, date_fns_1.endOfDay)(now);
            }
            // Filter payments for current period (if timeframe is not custom)
            const currentPeriodPayments = timeframe !== "custom"
                ? payments.filter(payment => {
                    const paymentDate = new Date(payment.createdAt);
                    return (0, date_fns_1.isWithinInterval)(paymentDate, {
                        start: currentPeriodStart,
                        end: currentPeriodEnd
                    });
                })
                : payments;
            console.log(`Current period (${timeframe}) has ${currentPeriodPayments.length} payments`);
            const successful = currentPeriodPayments.filter(p => p.paymentStatus === 'SUCCESSED').length;
            const pending = currentPeriodPayments.filter(p => p.paymentStatus === 'PENDING').length;
            const failed = currentPeriodPayments.filter(p => ['CANCELLED', 'DENIED', 'EXPIRED'].includes(p.paymentStatus)).length;
            const total = currentPeriodPayments.length;
            const conversionRate = total > 0 ? (successful / total) * 100 : 0;
            const paymentMethodsMap = new Map();
            currentPeriodPayments.forEach(payment => {
                const method = payment.paymentMethode || 'Unknown';
                if (!paymentMethodsMap.has(method)) {
                    paymentMethodsMap.set(method, { method, count: 0, value: 0 });
                }
                const methodStat = paymentMethodsMap.get(method);
                methodStat.count += 1;
                methodStat.value += payment.amount;
            });
            const paymentMethods = Array.from(paymentMethodsMap.values());
            const successfulPayments = currentPeriodPayments.filter(p => p.paymentStatus === 'SUCCESSED');
            const amounts = successfulPayments.map(p => p.amount);
            const averageValue = amounts.length > 0
                ? amounts.reduce((sum, val) => sum + val, 0) / amounts.length
                : 0;
            const highestValue = amounts.length > 0 ? Math.max(...amounts) : 0;
            const lowestValue = amounts.length > 0 ? Math.min(...amounts) : 0;
            return {
                count: {
                    successful,
                    pending,
                    failed,
                    total
                },
                conversionRate: parseFloat(conversionRate.toFixed(2)),
                paymentMethods,
                averageValue: Math.round(averageValue),
                highestValue,
                lowestValue
            };
        }
        catch (error) {
            console.error("Error in getTransactionMetrics:", error);
            throw new Error(`Error getting transaction metrics: ${error.message}`);
        }
    });
}
