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
exports.updateHooktStatus = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const client_1 = require("../../../prisma/generated/client");
const updateHooktStatus = (body) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Received webhook payload:", JSON.stringify(body, null, 2));
        const { order_id, transaction_status, payment_type } = body;
        if (!order_id || !transaction_status) {
            console.error("Invalid request: order_id and transaction_status are required");
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
        console.log(`Mapped payment status: ${paymentStatus}`);
        // Cari invoice berdasarkan order_id
        console.log(`Searching for invoice with order_id: ${order_id}`);
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
        console.log("Found invoice:", existingInvoice);
        // Cari apakah ada delivery order yang sesuai dengan orderId
        console.log(`Checking if delivery order exists for orderId: ${existingInvoice.orderId}`);
        const existingDeliveryOrder = yield prisma_1.default.deliveryOrder.findUnique({
            where: { orderId: existingInvoice.orderId }, // Fix: gunakan orderId
        });
        if (!existingDeliveryOrder) {
            console.warn(`No delivery order found for orderId: ${existingInvoice.orderId}, skipping update`);
        }
        let newOrderStatus;
        let newDeliveryStatus;
        if (paymentStatus === client_1.PaymentStatus.SUCCESSED) {
            console.log(`Checking order status for payment success: ${existingInvoice.order.orderStatus}`);
            if (existingInvoice.order.orderStatus === client_1.OrderStatus.AWAITING_PAYMENT) {
                console.log("Updating order status to READY_FOR_DELIVERY and delivery status to WAITING_FOR_DRIVER");
                newOrderStatus = client_1.OrderStatus.READY_FOR_DELIVERY;
                newDeliveryStatus = client_1.DeliveryStatus.WAITING_FOR_DRIVER;
            }
            else {
                console.log("Order status is not AWAITING_PAYMENT, no order status change");
            }
        }
        console.log("Updating database with new statuses...");
        yield prisma_1.default.$transaction([
            prisma_1.default.payment.update({
                where: { id: existingInvoice.id },
                data: { paymentStatus, paymentMethode: payment_type || null },
            }),
            prisma_1.default.order.update({
                where: { id: existingInvoice.orderId },
                data: Object.assign(Object.assign({}, (newOrderStatus ? { orderStatus: newOrderStatus } : {})), (paymentStatus === client_1.PaymentStatus.SUCCESSED
                    ? { isPaid: true }
                    : {})),
            }),
            ...(newDeliveryStatus
                ? [
                    prisma_1.default.deliveryOrder.update({
                        where: { orderId: existingInvoice.orderId },
                        data: { deliveryStatus: newDeliveryStatus },
                    }),
                ]
                : []),
        ]);
        console.log(`Payment updated for order ${order_id}. New status: ${newOrderStatus}, Delivery: ${newDeliveryStatus}`);
        return { message: "Payment updated successfully" };
    }
    catch (error) {
        console.error(`Error updating payment for order_id=${body.order_id}:`, error);
        throw error;
    }
});
exports.updateHooktStatus = updateHooktStatus;
