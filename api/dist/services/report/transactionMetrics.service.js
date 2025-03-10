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
            // Log date range for clarity
            if (otherWhereClause.createdAt) {
                console.log(`Fetching payments from ${(0, date_fns_1.format)(otherWhereClause.createdAt.gte, 'yyyy-MM-dd HH:mm:ss')} to ${(0, date_fns_1.format)(otherWhereClause.createdAt.lte, 'yyyy-MM-dd HH:mm:ss')}`);
            }
            // Find all payments within the specified date range
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
            console.log(`Found ${payments.length} payments in the specified date range`);
            // IMPORTANT: Use all payments in the date range, not just "current period"
            // This ensures consistency across all reports
            const filteredPayments = payments;
            // Calculate metrics based on all payments in the date range
            const successful = filteredPayments.filter(p => p.paymentStatus === 'SUCCESSED').length;
            const pending = filteredPayments.filter(p => p.paymentStatus === 'PENDING').length;
            const failed = filteredPayments.filter(p => ['CANCELLED', 'DENIED', 'EXPIRED'].includes(p.paymentStatus)).length;
            const total = filteredPayments.length;
            const conversionRate = total > 0 ? successful / total : 0;
            // Process payment methods
            const paymentMethodsMap = new Map();
            filteredPayments.forEach(payment => {
                const method = payment.paymentMethode || 'Unknown';
                if (!paymentMethodsMap.has(method)) {
                    paymentMethodsMap.set(method, { method, count: 0, value: 0 });
                }
                const methodStat = paymentMethodsMap.get(method);
                methodStat.count += 1;
                methodStat.value += payment.amount;
            });
            const paymentMethods = Array.from(paymentMethodsMap.values());
            // Calculate transaction value statistics
            const successfulPayments = filteredPayments.filter(p => p.paymentStatus === 'SUCCESSED');
            const amounts = successfulPayments.map(p => p.amount);
            const averageValue = amounts.length > 0
                ? amounts.reduce((sum, val) => sum + val, 0) / amounts.length
                : 0;
            const highestValue = amounts.length > 0 ? Math.max(...amounts) : 0;
            const lowestValue = amounts.length > 0 ? Math.min(...amounts) : 0;
            // Log summary for debugging
            console.log(`Transaction metrics summary for ${timeframe}:`, {
                total,
                successful,
                pending,
                failed,
                avgValue: Math.round(averageValue)
            });
            return {
                count: {
                    successful,
                    pending,
                    failed,
                    total
                },
                conversionRate: parseFloat(conversionRate.toFixed(4)),
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
