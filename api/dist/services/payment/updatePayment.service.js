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
exports.updatePaymentService = void 0;
const client_1 = require("prisma/generated/client");
const prisma_1 = __importDefault(require("../../prisma"));
const updatePaymentService = (body) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { order_id, fraud_status, payment_type, transaction_status } = body;
        if (!order_id || !transaction_status) {
            throw new Error("Invalid request: order_id and transaction_status are required");
        }
        const existingInvoice = yield prisma_1.default.payment.findUnique({
            where: { invoiceNumber: order_id },
            select: {
                id: true,
                orderId: true,
                order: { select: { orderStatus: true } },
            },
        });
        if (!existingInvoice) {
            throw new Error(`Invoice Not Found: order_id=${order_id}`);
        }
        let paymentStatus;
        let updateOrderStatus = false;
        switch (transaction_status) {
            case "capture":
                if (fraud_status === "accept") {
                    paymentStatus = client_1.PaymentStatus.SUCCESSED;
                    updateOrderStatus = true;
                }
                break;
            case "settlement":
                paymentStatus = client_1.PaymentStatus.SUCCESSED;
                updateOrderStatus = true;
                break;
            case "cancel":
                paymentStatus = client_1.PaymentStatus.CANCELLED;
                break;
            case "deny":
                paymentStatus = client_1.PaymentStatus.DENIED;
                break;
            case "expire":
                paymentStatus = client_1.PaymentStatus.EXPIRED;
                break;
            case "pending":
                paymentStatus = client_1.PaymentStatus.PENDING;
                break;
            default:
                throw new Error(`Invalid transaction_status received: ${transaction_status}`);
        }
        yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            if (paymentStatus) {
                yield tx.payment.update({
                    where: { id: existingInvoice.id },
                    data: {
                        paymentStatus,
                        paymentMethode: payment_type || null,
                    },
                });
            }
            // Update status order jika perlu
            if (updateOrderStatus) {
                const orderUpdate = { isPaid: true };
                if (existingInvoice.order.orderStatus === "AWAITING_PAYMENT") {
                    orderUpdate.orderStatus = "READY_FOR_DELIVERY";
                }
                yield tx.order.update({
                    where: { id: existingInvoice.orderId },
                    data: orderUpdate,
                });
            }
        }));
        return { message: "Payment updated successfully" };
    }
    catch (error) {
        console.error(`Error updating payment for order_id=${body.order_id}:`, error);
        throw error;
    }
});
exports.updatePaymentService = updatePaymentService;
