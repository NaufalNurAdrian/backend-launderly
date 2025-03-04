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
exports.confirmOrderService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const confirmOrderService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.body;
        if (!orderId) {
            return res.status(400).json({ message: "Order ID is required!" });
        }
        const order = yield prisma_1.default.order.findUnique({
            where: { id: parseInt(orderId, 10) },
        });
        if (!order) {
            return res.status(404).json({ message: "Order not found!" });
        }
        if (order.isConfirm) {
            return res.status(400).json({ message: "Order is already confirmed!" });
        }
        if (order.orderStatus !== "RECEIVED_BY_CUSTOMER") {
            return res.status(400).json({ message: "Order cannot be confirmed at this stage!" });
        }
        const updatedOrder = yield prisma_1.default.$transaction([
            prisma_1.default.order.update({
                where: { id: parseInt(orderId, 10) },
                data: {
                    orderStatus: "COMPLETED",
                    isConfirm: true,
                    confirmedAt: new Date(),
                },
            }),
        ]);
        return res.status(200).json({
            message: "Order has been confirmed successfully!",
            order: updatedOrder[0],
        });
    }
    catch (error) {
        console.error("Error confirming order:", error);
        return res.status(500).json({ message: "An internal server error occurred!" });
    }
});
exports.confirmOrderService = confirmOrderService;
