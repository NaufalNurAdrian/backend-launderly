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
exports.getOrdersService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const client_1 = require("@prisma/client");
const getOrdersService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { page, sortBy, sortOrder, take, id, filterOutlet, filterStatus, filterDate, search, filterCategory, } = query;
        const existingUser = yield prisma_1.default.user.findFirst({
            where: { id: id },
            select: { employee: true, role: true },
        });
        const whereClause = {};
        if ((existingUser === null || existingUser === void 0 ? void 0 : existingUser.role) == "SUPER_ADMIN" && filterOutlet != "all") {
            const pickupOrderData = yield prisma_1.default.pickupOrder.findMany({
                where: { outletId: Number(filterOutlet) },
                select: { id: true },
            });
            const pickupOrderIds = pickupOrderData.map((pickup) => pickup.id);
            whereClause.pickupOrderId = { in: pickupOrderIds };
        }
        if ((existingUser === null || existingUser === void 0 ? void 0 : existingUser.role) != "SUPER_ADMIN") {
            const pickupOrderData = yield prisma_1.default.pickupOrder.findMany({
                where: { outletId: (_a = existingUser === null || existingUser === void 0 ? void 0 : existingUser.employee) === null || _a === void 0 ? void 0 : _a.outletId },
                select: { id: true },
            });
            const pickupOrderIds = pickupOrderData.map((pickup) => pickup.id);
            whereClause.pickupOrderId = { in: pickupOrderIds };
        }
        if ((existingUser === null || existingUser === void 0 ? void 0 : existingUser.role) === "OUTLET_ADMIN") {
            if (!((_b = existingUser === null || existingUser === void 0 ? void 0 : existingUser.employee) === null || _b === void 0 ? void 0 : _b.outletId)) {
                throw new Error("Outlet ID not found for this admin");
            }
            const pickupOrderData = yield prisma_1.default.pickupOrder.findMany({
                where: { outletId: existingUser === null || existingUser === void 0 ? void 0 : existingUser.employee.outletId },
                select: { id: true },
            });
            whereClause.pickupOrderId = {
                in: pickupOrderData.map((pickup) => pickup.id),
            };
        }
        if (filterStatus !== "all") {
            whereClause.orderStatus = filterStatus;
        }
        if (filterStatus == "all") {
            if (filterCategory == "pickup") {
                whereClause.orderStatus = {
                    in: [
                        client_1.OrderStatus.WAITING_FOR_PICKUP_DRIVER,
                        client_1.OrderStatus.ON_THE_WAY_TO_CUSTOMER,
                        client_1.OrderStatus.ON_THE_WAY_TO_OUTLET,
                        client_1.OrderStatus.ARRIVED_AT_OUTLET,
                    ],
                };
            }
            if (filterCategory == "process") {
                whereClause.orderStatus = {
                    in: [
                        client_1.OrderStatus.READY_FOR_WASHING,
                        client_1.OrderStatus.BEING_WASHED,
                        client_1.OrderStatus.WASHING_COMPLETED,
                        client_1.OrderStatus.BEING_IRONED,
                        client_1.OrderStatus.IRONING_COMPLETED,
                        client_1.OrderStatus.BEING_PACKED,
                        client_1.OrderStatus.AWAITING_PAYMENT,
                    ],
                };
            }
            if (filterCategory == "delivery") {
                whereClause.orderStatus = {
                    in: [
                        client_1.OrderStatus.READY_FOR_DELIVERY,
                        client_1.OrderStatus.WAITING_FOR_DELIVERY_DRIVER,
                        client_1.OrderStatus.BEING_DELIVERED_TO_CUSTOMER,
                        client_1.OrderStatus.RECEIVED_BY_CUSTOMER,
                    ],
                };
            }
            if (filterCategory == "completed") {
                whereClause.orderStatus = {
                    in: [client_1.OrderStatus.COMPLETED],
                };
            }
        }
        if (filterDate !== undefined) {
            const selectedDate = new Date(filterDate);
            const currentDate = new Date(selectedDate);
            currentDate.setTime(currentDate.getTime() + 7 * 60 * 60 * 1000);
            const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));
            whereClause.createdAt = {
                gte: startOfDay,
                lte: endOfDay,
            };
        }
        if (search !== "") {
            whereClause.orderNumber = {
                contains: search === null || search === void 0 ? void 0 : search.toUpperCase(),
            };
        }
        const orders = yield prisma_1.default.order.findMany({
            where: whereClause,
            skip: (page - 1) * take,
            take: take,
            orderBy: {
                [sortBy]: sortOrder,
            },
            include: {
                orderItem: { include: { laundryItem: true } },
                pickupOrder: { include: { user: true } },
                orderWorker: { include: { worker: { include: { user: true } } } },
            },
        });
        const count = yield prisma_1.default.order.count({ where: whereClause });
        return {
            orders,
            meta: { page, take, total: count },
        };
    }
    catch (error) {
        throw error;
    }
});
exports.getOrdersService = getOrdersService;
