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
exports.updateRequestStatusService = void 0;
const createNotification_service_1 = require("../notifications/createNotification.service");
const prisma_1 = __importDefault(require("../../prisma"));
const client_1 = require("../../../prisma/generated/client");
const mapToOrderStatus = (status) => {
    switch (status) {
        case client_1.PickupStatus.WAITING_FOR_DRIVER:
            return client_1.OrderStatus.WAITING_FOR_PICKUP_DRIVER;
        case client_1.PickupStatus.ON_THE_WAY_TO_CUSTOMER:
            return client_1.OrderStatus.ON_THE_WAY_TO_CUSTOMER;
        case client_1.PickupStatus.ON_THE_WAY_TO_OUTLET:
            return client_1.OrderStatus.ON_THE_WAY_TO_OUTLET;
        case client_1.PickupStatus.RECEIVED_BY_OUTLET:
            return client_1.OrderStatus.ARRIVED_AT_OUTLET;
        case client_1.DeliveryStatus.WAITING_FOR_DRIVER:
            return client_1.OrderStatus.WAITING_FOR_DELIVERY_DRIVER;
        case client_1.DeliveryStatus.ON_THE_WAY_TO_OUTLET:
            return client_1.OrderStatus.ON_THE_WAY_TO_OUTLET;
        case client_1.DeliveryStatus.ON_THE_WAY_TO_CUSTOMER:
            return client_1.OrderStatus.BEING_DELIVERED_TO_CUSTOMER;
        case client_1.DeliveryStatus.RECEIVED_BY_CUSTOMER:
            return client_1.OrderStatus.RECEIVED_BY_CUSTOMER;
        default:
            throw new Error("Status tidak valid");
    }
};
const updateRequestStatusService = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { driverId, requestId, type } = data;
        const driver = yield prisma_1.default.employee.findUnique({
            where: { userId: driverId },
            select: { outletId: true, id: true },
        });
        if (!driver || !driver.outletId) {
            throw new Error("Driver have no access to this outlet");
        }
        const existingPickupOrders = yield prisma_1.default.pickupOrder.findMany({
            where: {
                driverId: driver.id,
                id: { not: requestId },
                pickupStatus: {
                    not: client_1.PickupStatus.RECEIVED_BY_OUTLET,
                },
            },
        });
        const existingDeliveryOrders = yield prisma_1.default.deliveryOrder.findMany({
            where: {
                driverId: driver.id,
                id: { not: requestId },
                deliveryStatus: {
                    not: client_1.DeliveryStatus.RECEIVED_BY_CUSTOMER,
                },
            },
        });
        if (existingPickupOrders.length > 0 || existingDeliveryOrders.length > 0) {
            throw new Error("Driver is currently processing another order");
        }
        let request;
        if (type === "pickup") {
            request = yield prisma_1.default.pickupOrder.findUnique({
                where: { id: requestId },
            });
        }
        else if (type === "delivery") {
            request = yield prisma_1.default.deliveryOrder.findUnique({
                where: { id: requestId },
            });
        }
        else {
            throw new Error("invalid request type");
        }
        if (!request) {
            throw new Error("Request not found");
        }
        let nextStatus;
        if (type === "pickup" && "pickupStatus" in request) {
            switch (request.pickupStatus) {
                case client_1.PickupStatus.WAITING_FOR_DRIVER:
                    nextStatus = client_1.PickupStatus.ON_THE_WAY_TO_CUSTOMER;
                    break;
                case client_1.PickupStatus.ON_THE_WAY_TO_CUSTOMER:
                    nextStatus = client_1.PickupStatus.ON_THE_WAY_TO_OUTLET;
                    break;
                case client_1.PickupStatus.ON_THE_WAY_TO_OUTLET:
                    nextStatus = client_1.PickupStatus.RECEIVED_BY_OUTLET;
                    break;
                case client_1.PickupStatus.RECEIVED_BY_OUTLET:
                    throw new Error("Pickup request finished");
                default:
                    throw new Error("invalid pickup request status");
            }
        }
        else if (type === "delivery" && "deliveryStatus" in request) {
            switch (request.deliveryStatus) {
                case client_1.DeliveryStatus.WAITING_FOR_DRIVER:
                    nextStatus = client_1.DeliveryStatus.ON_THE_WAY_TO_OUTLET;
                    break;
                case client_1.DeliveryStatus.ON_THE_WAY_TO_OUTLET:
                    nextStatus = client_1.DeliveryStatus.ON_THE_WAY_TO_CUSTOMER;
                    break;
                case client_1.DeliveryStatus.ON_THE_WAY_TO_CUSTOMER:
                    nextStatus = client_1.DeliveryStatus.RECEIVED_BY_CUSTOMER;
                    break;
                case client_1.DeliveryStatus.RECEIVED_BY_CUSTOMER:
                    throw new Error("Delivery request finished");
                default:
                    throw new Error("invalid delivery request status");
            }
        }
        else {
            throw new Error("invalid request type");
        }
        let updatedRequest;
        if (type === "pickup" && "pickupStatus" in request) {
            updatedRequest = yield prisma_1.default.pickupOrder.update({
                where: { id: requestId },
                data: {
                    pickupStatus: nextStatus,
                    driverId: driver.id,
                },
                include: {
                    address: true,
                    user: true,
                },
            });
            yield prisma_1.default.order.update({
                where: { pickupOrderId: requestId },
                data: {
                    orderStatus: mapToOrderStatus(nextStatus),
                },
            });
        }
        else if (type === "delivery" && "deliveryStatus" in request) {
            updatedRequest = yield prisma_1.default.deliveryOrder.update({
                where: { id: requestId },
                data: {
                    deliveryStatus: nextStatus,
                    driverId: driver.id,
                },
                include: {
                    address: true,
                    user: true,
                },
            });
            yield prisma_1.default.order.update({
                where: { id: updatedRequest.orderId },
                data: {
                    orderStatus: mapToOrderStatus(nextStatus),
                },
            });
        }
        if (type === "pickup" && nextStatus === client_1.PickupStatus.RECEIVED_BY_OUTLET) {
            const nextStation = "WASHING";
            yield (0, createNotification_service_1.createNotificationForNextStation)(requestId, nextStation);
        }
        return updatedRequest;
    }
    catch (err) {
        throw err;
    }
});
exports.updateRequestStatusService = updateRequestStatusService;
