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
exports.getRevenueMetrics = getRevenueMetrics;
const prisma_1 = __importDefault(require("../../prisma"));
function getRevenueMetrics(baseWhereClause) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const orders = yield prisma_1.default.order.findMany({
                where: {
                    pickupOrder: {
                        outletId: baseWhereClause.outletId,
                    },
                    createdAt: baseWhereClause.createdAt,
                },
                include: {
                    payment: {
                        where: {
                            paymentStatus: "SUCCESSED",
                        },
                    },
                    pickupOrder: true,
                    deliveryOrder: true,
                },
            });
            let totalRevenue = 0;
            let laundryRevenue = 0;
            let pickupRevenue = 0;
            let deliveryRevenue = 0;
            orders.forEach(order => {
                var _a;
                const laundryPayments = order.payment.reduce((sum, payment) => sum + payment.amount, 0);
                laundryRevenue += laundryPayments;
                if (order.pickupOrder) {
                    pickupRevenue += order.pickupOrder.pickupPrice;
                }
                if (order.deliveryOrder) {
                    deliveryRevenue += (_a = order.deliveryOrder) === null || _a === void 0 ? void 0 : _a[0].deliveryPrice;
                }
            });
            totalRevenue = laundryRevenue + pickupRevenue + deliveryRevenue;
            const dailyRevenueMap = new Map();
            orders.forEach(order => {
                var _a;
                const orderDate = order.createdAt.toISOString().split('T')[0];
                if (!dailyRevenueMap.has(orderDate)) {
                    dailyRevenueMap.set(orderDate, {
                        date: orderDate,
                        total: 0,
                        laundry: 0,
                        pickup: 0,
                        delivery: 0,
                    });
                }
                const dayStats = dailyRevenueMap.get(orderDate);
                const laundryAmount = order.payment.reduce((sum, payment) => sum + payment.amount, 0);
                dayStats.laundry += laundryAmount;
                if (order.pickupOrder) {
                    dayStats.pickup += order.pickupOrder.pickupPrice;
                }
                if (order.deliveryOrder) {
                    dayStats.delivery += (_a = order.deliveryOrder) === null || _a === void 0 ? void 0 : _a[0].deliveryPrice;
                }
                dayStats.total = dayStats.laundry + dayStats.pickup + dayStats.delivery;
            });
            const dailyRevenue = Array.from(dailyRevenueMap.values())
                .sort((a, b) => a.date.localeCompare(b.date));
            return {
                total: totalRevenue,
                breakdown: {
                    laundry: laundryRevenue,
                    pickup: pickupRevenue,
                    delivery: deliveryRevenue
                },
                daily: dailyRevenue
            };
        }
        catch (error) {
            console.error("Error in getRevenueMetrics:", error);
            throw new Error(`Error getting revenue metrics: ${error.message}`);
        }
    });
}
