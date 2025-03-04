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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const createPayment_service_1 = require("../services/payment/createPayment.service");
const getPayment_service_1 = require("../services/payment/getPayment.service");
const getPaymentChart_service_1 = require("../services/payment/getPaymentChart.service");
const updatePayment_service_1 = require("../services/payment/updatePayment.service");
const getPaymentById_service_1 = require("../services/payment/getPaymentById.service");
const updateHook_service_1 = require("../services/payment/updateHook.service");
class PaymentController {
    createPaymentController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield (0, createPayment_service_1.createPaymentService)(req.body);
                res.status(200).send(result);
                return;
            }
            catch (error) {
                next(error);
            }
        });
    }
    getPaymentController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = {
                    id: parseInt(req.query.id),
                    orderId: parseInt(req.query.orderId),
                };
                const result = yield (0, getPayment_service_1.getPaymentService)(query);
                res.status(200).send(result);
                return;
            }
            catch (error) {
                next(error);
            }
        });
    }
    getPaymentChartController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = {
                    id: parseInt(res.locals.user.id),
                    filterOutlet: parseInt(req.query.filterOutlet) || 'all',
                    filterMonth: req.query.filterMonth,
                    filterYear: req.query.filterYear,
                };
                const result = yield (0, getPaymentChart_service_1.getPaymentChartService)(query);
                res.status(200).send(result);
                return;
            }
            catch (error) {
                next(error);
            }
        });
    }
    updatePaymentController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { order_id, transaction_status } = req.body;
                // Validasi input awal sebelum dikirim ke service
                if (!order_id || !transaction_status) {
                    res.status(400).json({
                        status: "fail",
                        message: "order_id and transaction_status are required",
                    });
                    return;
                }
                const result = yield (0, updatePayment_service_1.updatePaymentService)(req.body);
                res.status(200).json({
                    status: "success",
                    message: result.message,
                });
                return;
            }
            catch (error) {
                console.error("Error in updatePaymentController:", error);
                if (error instanceof Error && error.message.includes("Not Found")) {
                    res.status(404).json({
                        status: "fail",
                        message: error.message,
                    });
                    return;
                }
                next(error);
            }
        });
    }
    getUserPaymentByIdController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = Number(req.params.userId);
                if (isNaN(userId)) {
                    res.status(400).json({ success: false, message: "Invalid User ID" });
                    return;
                }
                const payments = yield (0, getPaymentById_service_1.getUserPaymentsService)(userId);
                res.status(200).json({ success: true, payments });
                return;
            }
            catch (error) {
                next(error);
            }
        });
    }
    handlePaymentWebhook(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Received Midtrans webhook:", req.body);
                const { transaction_status, order_id } = req.body;
                if (!transaction_status || !order_id) {
                    res.status(400).json({ error: "Missing transaction_status or order_id" });
                    return;
                }
                yield (0, updateHook_service_1.updatePaymentStatus)(order_id);
                res.status(200).json({ message: "Payment status updated successfully" });
            }
            catch (error) {
                console.error("Midtrans Webhook Error:", error);
            }
        });
    }
}
exports.PaymentController = PaymentController;
