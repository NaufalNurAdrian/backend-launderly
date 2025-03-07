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
exports.UpdateOrderService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const client_1 = require("prisma/generated/client");
const UpdateOrderService = (body) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { weight, orderNumber, orderItem } = body;
        const existingOrder = yield prisma_1.default.order.findFirst({
            where: { orderNumber: orderNumber },
            select: {
                id: true,
                pickupOrder: { select: { outletId: true, pickupNumber: true } },
            },
        });
        if (!existingOrder) {
            throw new Error("Order Not Found!");
        }
        if (!weight) {
            throw new Error("Weight is required");
        }
        const updatedOrder = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const addDataOrder = yield tx.order.update({
                where: {
                    id: existingOrder.id,
                },
                data: {
                    weight: Number(weight),
                    laundryPrice: Number(weight * 6000),
                    orderStatus: client_1.OrderStatus.READY_FOR_WASHING,
                },
            });
            const addDataOrderItems = yield Promise.all(orderItem.map((item) => __awaiter(void 0, void 0, void 0, function* () {
                return yield tx.orderItem.create({
                    data: {
                        orderId: addDataOrder.id,
                        qty: Number(item.qty),
                        laundryItemId: Number(item.laundryItemId),
                    },
                });
            })));
            const updateDataPickupOrder = yield tx.pickupOrder.update({
                where: { pickupNumber: (_a = existingOrder.pickupOrder) === null || _a === void 0 ? void 0 : _a.pickupNumber },
                data: {
                    isOrderCreated: true,
                },
            });
            const now = new Date();
            const currentHour = now.getUTCHours() + 7;
            let setWorkShift = currentHour >= 6 && currentHour < 18
                ? client_1.EmployeeWorkShift.DAY
                : client_1.EmployeeWorkShift.NIGHT;
            const createNotification = yield tx.notification.create({
                data: {
                    title: "Incoming Laundry Task",
                    description: "New laundry arrived at washing station",
                },
            });
            const getUserId = yield tx.employee.findMany({
                where: {
                    outletId: (_b = existingOrder.pickupOrder) === null || _b === void 0 ? void 0 : _b.outletId,
                    workShift: setWorkShift,
                    station: "WASHING",
                },
                select: { userId: true },
            });
            const userIds = getUserId.map((user) => user.userId);
            const createUserNotification = yield Promise.all(userIds.map((userId) => __awaiter(void 0, void 0, void 0, function* () {
                yield tx.userNotification.create({
                    data: {
                        notificationId: createNotification.id,
                        userId: userId,
                    },
                });
            })));
            return {
                order: addDataOrder,
                orderItem: addDataOrderItems,
                pickupOrder: updateDataPickupOrder,
                userNotification: createUserNotification,
            };
        }));
        return updatedOrder;
    }
    catch (error) {
        throw error;
    }
});
exports.UpdateOrderService = UpdateOrderService;
