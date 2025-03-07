"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderWorkerRouter = void 0;
const express_1 = require("express");
const workerOrder_controller_1 = require("../controllers/worker/workerOrder.controller");
const verify_1 = require("../middlewares/verify");
class OrderWorkerRouter {
    constructor() {
        this.orderWorkerController = new workerOrder_controller_1.OrderWorkerController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", verify_1.verifyToken, (0, verify_1.verifyRoleAndAttendance)(["WORKER"]), this.orderWorkerController.getOrders);
        this.router.get("/history", verify_1.verifyToken, (0, verify_1.verifyRole)(["WORKER"]), this.orderWorkerController.getOrderHistory);
        this.router.get("/orders/:orderId", this.orderWorkerController.getOrderItem);
        this.router.post("/create/:orderId", verify_1.verifyToken, (0, verify_1.verifyRoleAndAttendance)(["WORKER"]), this.orderWorkerController.createOrderWorker);
        this.router.patch("/complete/:orderId", verify_1.verifyToken, (0, verify_1.verifyRoleAndAttendance)(["WORKER"]), this.orderWorkerController.finishOrderWorker);
    }
    getRouter() {
        return this.router;
    }
}
exports.OrderWorkerRouter = OrderWorkerRouter;
