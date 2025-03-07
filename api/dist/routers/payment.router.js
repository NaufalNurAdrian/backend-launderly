"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRouter = void 0;
const payment_controller_1 = require("../controllers/payment.controller");
const verify_1 = require("../middlewares/verify");
const express_1 = require("express");
class PaymentRouter {
    constructor() {
        this.paymentController = new payment_controller_1.PaymentController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get('/order', verify_1.verifyToken, this.paymentController.getPaymentController);
        this.router.get('/report-chart', verify_1.verifyToken, this.paymentController.getPaymentChartController);
        this.router.get('/:userId', verify_1.verifyToken, this.paymentController.getUserPaymentByIdController);
        this.router.post('/', verify_1.verifyToken, this.paymentController.createPaymentController);
        this.router.post('/midtrans-callback', this.paymentController.handlePaymentWebhook);
    }
    getRouter() {
        return this.router;
    }
}
exports.PaymentRouter = PaymentRouter;
