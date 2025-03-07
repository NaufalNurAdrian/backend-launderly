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
exports.createPaymentService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const midtrans_node_client_1 = require("midtrans-node-client");
const snap = new midtrans_node_client_1.MidtransClient.Snap({
    isProduction: false,
    clientKey: process.env.MID_CLIENT_KEY,
    serverKey: process.env.MID_SERVER_KEY,
});
const createPaymentService = (body) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { orderId } = body;
        if (!orderId)
            throw new Error("Order ID is required");
        const existingOrder = yield prisma_1.default.order.findFirst({
            where: { id: orderId },
            include: { pickupOrder: true, deliveryOrder: true },
        });
        if (!existingOrder)
            throw new Error("Order Not Found!");
        if (!existingOrder.laundryPrice)
            throw new Error("Order Not Yet Processed by Admin");
        if (!existingOrder.pickupOrder)
            throw new Error("No Pickup Order Found!");
        if (!existingOrder.deliveryOrder.length)
            throw new Error("No Delivery Order Found!");
        if (!existingOrder.deliveryOrder[0].deliveryPrice)
            throw new Error("Delivery Price Missing!");
        if (existingOrder.isPaid) {
            return yield prisma_1.default.payment.findFirst({
                where: { orderId: orderId, paymentStatus: "SUCCESSED" },
            });
        }
        const outstandingPayment = yield prisma_1.default.payment.findFirst({
            where: {
                orderId: orderId,
                paymentStatus: "PENDING",
                snapToken: { not: null },
            },
        });
        if (outstandingPayment)
            return outstandingPayment;
<<<<<<< HEAD
        const amount = (existingOrder.laundryPrice || 0) +
            (existingOrder.pickupOrder.pickupPrice || 0) +
            (((_a = existingOrder.deliveryOrder[0]) === null || _a === void 0 ? void 0 : _a.deliveryPrice) || 0);
=======
        const amount = (existingOrder.laundryPrice || 0) + (existingOrder.pickupOrder.pickupPrice || 0) + (((_a = existingOrder.deliveryOrder[0]) === null || _a === void 0 ? void 0 : _a.deliveryPrice) || 0);
>>>>>>> 67e351f8aa1f613af1c69e9ed81c6311eaa563db
        const padNumber = (num, size) => {
            let s = num.toString();
            while (s.length < size)
                s = "0" + s;
            return s;
        };
        const orderNumberParts = existingOrder.orderNumber.split("-");
        if (orderNumberParts.length < 2)
            throw new Error("Invalid order number format");
        const orderNumberPart = orderNumberParts.pop();
        const lastInvoice = yield prisma_1.default.payment.findFirst({
            where: {
                invoiceNumber: {
                    contains: `INV-${padNumber(existingOrder.pickupOrder.userId, 4)}-${orderNumberPart}-`,
                },
            },
            orderBy: { invoiceNumber: "desc" },
        });
        const getNextInvoiceNumber = (lastInvoice) => {
            if (!lastInvoice)
                return padNumber(1, 4);
            const invoiceParts = lastInvoice.invoiceNumber.split("-");
            const lastPart = invoiceParts.pop();
<<<<<<< HEAD
            return lastPart && !isNaN(Number(lastPart))
                ? padNumber(Number(lastPart) + 1, 4)
                : padNumber(1, 4);
=======
            return lastPart && !isNaN(Number(lastPart)) ? padNumber(Number(lastPart) + 1, 4) : padNumber(1, 4);
>>>>>>> 67e351f8aa1f613af1c69e9ed81c6311eaa563db
        };
        const nextIncrement = getNextInvoiceNumber(lastInvoice);
        const invoiceNumber = `INV-${padNumber(existingOrder.pickupOrder.userId, 4)}-${orderNumberPart}-${nextIncrement}`;
        const createPayment = yield prisma_1.default.payment.create({
            data: {
                orderId: orderId,
                invoiceNumber: invoiceNumber,
                amount: amount,
            },
        });
        const payload = {
            transaction_details: {
                order_id: createPayment.invoiceNumber,
                gross_amount: amount,
            },
            customer_details: {
                first_name: existingOrder.pickupOrder.userId.toString(),
                last_name: "Customer",
            },
        };
        const transaction = yield snap.createTransaction(payload);
        const updatePaymentToken = yield prisma_1.default.payment.update({
            where: { id: createPayment.id },
            data: {
                snapToken: transaction.token,
                snapRedirectUrl: transaction.redirect_url,
            },
        });
        return updatePaymentToken;
    }
    catch (error) {
        console.error("Error in createPaymentService:", error);
        return { success: false, message: "ada error" };
    }
});
exports.createPaymentService = createPaymentService;
