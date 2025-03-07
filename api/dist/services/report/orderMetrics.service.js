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
exports.getOrderMetrics = getOrderMetrics;
const prisma_1 = __importDefault(require("../../prisma"));
function getOrderMetrics(baseWhereClause) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const ordersByStatus = yield prisma_1.default.order.groupBy({
                by: ['orderStatus'],
                where: {
                    pickupOrder: {
                        outletId: baseWhereClause.outletId,
                    },
                    createdAt: baseWhereClause.createdAt,
                },
                _count: true,
            });
            const completedOrders = yield prisma_1.default.order.findMany({
                where: {
                    orderStatus: "COMPLETED",
                    pickupOrder: {
                        outletId: baseWhereClause.outletId,
                    },
                    createdAt: baseWhereClause.createdAt,
                },
                select: {
                    createdAt: true,
                    updatedAt: true,
                },
            });
            const processingTimes = completedOrders.map(order => {
                const creationTime = new Date(order.createdAt).getTime();
                const completionTime = new Date(order.updatedAt).getTime();
                return (completionTime - creationTime) / (1000 * 60 * 60);
            });
            const avgProcessingTimeHours = processingTimes.length > 0
                ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
                : 0;
            const popularItems = yield prisma_1.default.orderItem.groupBy({
                by: ['laundryItemId'],
                where: {
                    order: {
                        pickupOrder: {
                            outletId: baseWhereClause.outletId,
                        },
                        createdAt: baseWhereClause.createdAt,
                    },
                    isDelete: false,
                },
                _sum: {
                    qty: true,
                },
            });
            const itemDetails = yield Promise.all(popularItems.map((item) => __awaiter(this, void 0, void 0, function* () {
                const laundryItem = yield prisma_1.default.laundryItem.findUnique({
                    where: { id: item.laundryItemId },
                    select: { itemName: true },
                });
                return {
                    id: item.laundryItemId,
                    name: (laundryItem === null || laundryItem === void 0 ? void 0 : laundryItem.itemName) || "Unknown Item",
                    quantity: item._sum.qty || 0,
                };
            })));
            const sortedPopularItems = itemDetails
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, 10);
            return {
                byStatus: ordersByStatus,
                avgProcessingTimeHours: parseFloat(avgProcessingTimeHours.toFixed(2)),
                popularItems: sortedPopularItems
            };
        }
        catch (error) {
            console.error("Error in getOrderMetrics:", error);
            throw new Error(`Error getting order metrics: ${error.message}`);
        }
    });
}
