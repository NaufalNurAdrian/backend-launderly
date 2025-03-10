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
exports.getCustomerMetrics = getCustomerMetrics;
const prisma_1 = __importDefault(require("../../prisma"));
function getCustomerMetrics(baseWhereClause, timeframe) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const activeCustomers = yield prisma_1.default.user.findMany({
                where: {
                    role: "CUSTOMER",
                    isDelete: false,
                    pickupOrder: {
                        some: {
                            createdAt: baseWhereClause.createdAt,
                            outletId: baseWhereClause.outletId,
                        },
                    },
                },
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    createdAt: true,
                    _count: {
                        select: {
                            pickupOrder: {
                                where: {
                                    createdAt: baseWhereClause.createdAt,
                                    outletId: baseWhereClause.outletId,
                                },
                            },
                        },
                    },
                },
            });
            const newCustomers = activeCustomers.filter(customer => customer.createdAt >= baseWhereClause.createdAt.gte).length;
            const returningCustomers = activeCustomers.length - newCustomers;
            const topCustomers = activeCustomers
                .sort((a, b) => b._count.pickupOrder - a._count.pickupOrder)
                .slice(0, 5)
                .map(customer => ({
                id: customer.id,
                name: customer.fullName,
                email: customer.email,
                orderCount: customer._count.pickupOrder,
                isNew: customer.createdAt >= baseWhereClause.createdAt.gte,
            }));
            return {
                active: activeCustomers.length,
                new: newCustomers,
                returning: returningCustomers,
                topCustomers
            };
        }
        catch (error) {
            console.error("Error in getCustomerMetrics:", error);
            throw new Error(`Error getting customer metrics: ${error.message}`);
        }
    });
}
