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
exports.updateOrderStatus = void 0;
const prisma_1 = __importDefault(require("../../../prisma"));
const client_1 = require("../../../../prisma/generated/client");
const updateOrderStatus = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const { workerId, orderId } = query;
    try {
        const worker = yield prisma_1.default.employee.findUnique({
            where: { userId: workerId },
        });
        if (!worker) {
            throw new Error("Worker not found");
        }
        const orderWorker = yield prisma_1.default.orderWorker.findFirst({
            where: {
                orderId: orderId,
                workerId: worker.id,
                isComplete: false,
            },
        });
        if (!orderWorker) {
            throw new Error("No active order found for this worker");
        }
        if (orderWorker.bypassRequest) {
            if (orderWorker.bypassAccepted === null) {
                throw new Error("Bypass request is still pending");
            }
            else if (orderWorker.bypassAccepted === true) {
                throw new Error("Bypass request has been accepted. You are no longer assigned to this order.");
            }
            else if (orderWorker.bypassAccepted === false) {
            }
        }
        let newStatus;
        if (worker.station === "WASHING") {
            newStatus = client_1.OrderStatus.WASHING_COMPLETED;
        }
        else if (worker.station === "IRONING") {
            newStatus = client_1.OrderStatus.IRONING_COMPLETED;
        }
        else if (worker.station === "PACKING") {
            const order = yield prisma_1.default.order.findUnique({
                where: { id: orderId },
                select: {
                    isPaid: true,
                    pickupOrder: {
                        select: {
                            outletId: true,
                            userId: true,
                            addressId: true,
                            distance: true,
                        },
                    },
                },
            });
            if (!order) {
                throw new Error("Order not found");
            }
            newStatus = order.isPaid
                ? client_1.OrderStatus.WAITING_FOR_DELIVERY_DRIVER
                : client_1.OrderStatus.AWAITING_PAYMENT;
            const deliveryOrder = yield prisma_1.default.deliveryOrder.update({
                where: { orderId: orderId },
                data: {
                    orderId: orderId,
                    deliveryStatus: order.isPaid
                        ? client_1.DeliveryStatus.WAITING_FOR_DRIVER
                        : client_1.DeliveryStatus.NOT_READY_TO_DELIVER,
                    driverId: null,
                },
            });
        }
        else {
            throw new Error("Invalid worker station");
        }
        const completedOrder = yield prisma_1.default.order.update({
            where: { id: orderId },
            data: { orderStatus: newStatus },
        });
        const updatedWorkerOrder = yield prisma_1.default.orderWorker.update({
            where: {
                id: orderWorker.id,
            },
            data: { isComplete: true },
        });
        const station = worker.station;
        const nextStation = station === "WASHING"
            ? "IRONING"
            : station === "IRONING"
                ? "PACKING"
                : null;
        if (nextStation) {
            const usersInNextStation = yield prisma_1.default.employee.findMany({
                where: { station: nextStation },
                select: { userId: true },
            });
            const notification = yield prisma_1.default.notification.create({
                data: {
                    title: `Incoming order`,
                    description: `The order is ready to be processed at the ${nextStation.toLowerCase()} station.`,
                },
            });
            for (const user of usersInNextStation) {
                yield prisma_1.default.userNotification.create({
                    data: {
                        userId: user.userId,
                        notificationId: notification.id,
                    },
                });
            }
        }
        return { order: completedOrder, detail: updatedWorkerOrder };
    }
    catch (error) {
        throw error;
    }
});
exports.updateOrderStatus = updateOrderStatus;
