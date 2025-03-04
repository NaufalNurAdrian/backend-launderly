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
exports.updatePaymentStatus = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const client_1 = require("@prisma/client");
const updatePaymentStatus = (body) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { order_id, transaction_status, payment_type } = body;
        if (!order_id || !transaction_status) {
            throw new Error("Invalid request: order_id and transaction_status are required");
        }
        // Mapping status Midtrans ke sistem internal
        const statusMapping = {
            settlement: client_1.PaymentStatus.SUCCESSED,
            pending: client_1.PaymentStatus.PENDING,
            expire: client_1.PaymentStatus.EXPIRED,
            cancel: client_1.PaymentStatus.CANCELLED,
            deny: client_1.PaymentStatus.DENIED,
        };
        const paymentStatus = statusMapping[transaction_status];
        if (!paymentStatus) {
            console.warn(`Received an unknown transaction_status: ${transaction_status}`);
            return { message: `Unknown transaction_status: ${transaction_status}` };
        }
        // Cari invoice berdasarkan order_id
        const existingInvoice = yield prisma_1.default.payment.findUnique({
            where: { invoiceNumber: order_id },
            select: {
                id: true,
                orderId: true,
                order: { select: { orderStatus: true } },
            },
        });
        if (!existingInvoice) {
            console.warn(`Invoice Not Found: ${order_id}`);
            return { message: "Invoice not found", success: false };
        }
        // Cek apakah order status perlu diupdate
        const updateOrderStatus = paymentStatus === client_1.PaymentStatus.SUCCESSED &&
            existingInvoice.order.orderStatus === client_1.OrderStatus.AWAITING_PAYMENT;
        // Jalankan transaksi Prisma
        yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            yield tx.payment.update({
                where: { id: existingInvoice.id },
                data: { paymentStatus, paymentMethode: payment_type || null },
            });
            if (updateOrderStatus) {
                yield tx.order.update({
                    where: { id: existingInvoice.orderId },
                    data: { orderStatus: client_1.OrderStatus.READY_FOR_DELIVERY, isPaid: true },
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
exports.updatePaymentStatus = updatePaymentStatus;
