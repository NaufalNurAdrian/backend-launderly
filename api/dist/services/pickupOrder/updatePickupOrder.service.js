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
exports.updatePickupOrderService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const client_1 = require("prisma/generated/client");
const updatePickupOrderService = (body) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { driverId, shipmentOrderId, status } = body;
        const existingPickupOrder = yield prisma_1.default.pickupOrder.findFirst({
            where: { id: shipmentOrderId },
            select: { pickupStatus: true },
        });
        if (!existingPickupOrder) {
            throw new Error("Pickup Order not Found!");
        }
        const existingEmployee = yield prisma_1.default.user.findFirst({
            where: { id: driverId },
            select: { employee: { select: { id: true } } },
        });
        if (!existingEmployee) {
            throw new Error("Employee not Found!");
        }
        let orderStatus;
        if (status == String(client_1.PickupStatus.ON_THE_WAY_TO_CUSTOMER)) {
            orderStatus = client_1.OrderStatus.ON_THE_WAY_TO_CUSTOMER;
        }
        if (status == String(client_1.PickupStatus.ON_THE_WAY_TO_OUTLET)) {
            orderStatus = client_1.OrderStatus.ON_THE_WAY_TO_OUTLET;
        }
        if (status == String(client_1.PickupStatus.RECEIVED_BY_OUTLET)) {
            orderStatus = client_1.OrderStatus.ARRIVED_AT_OUTLET;
        }
        const updateOrder = yield prisma_1.default.order.update({
            where: { pickupOrderId: shipmentOrderId },
            data: { orderStatus: orderStatus },
        });
        const updatePickupOrder = yield prisma_1.default.pickupOrder.update({
            where: { id: shipmentOrderId },
            data: {
                pickupStatus: status,
                driverId: (_a = existingEmployee.employee) === null || _a === void 0 ? void 0 : _a.id,
            },
        });
        return {
            pickupOrder: updatePickupOrder,
            order: updateOrder,
        };
    }
    catch (error) {
        throw error;
    }
});
exports.updatePickupOrderService = updatePickupOrderService;
