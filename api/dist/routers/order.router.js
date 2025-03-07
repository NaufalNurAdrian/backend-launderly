"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderRouter = void 0;
const order_controller_1 = require("../controllers/order.controller");
const verify_1 = require("../middlewares/verify");
const asyncMiddleware_1 = require("../middlewares/asyncMiddleware");
const express_1 = require("express");
class OrderRouter {
    constructor() {
        this.orderController = new order_controller_1.OrderController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/create", verify_1.verifyToken, verify_1.checkSuperAdmin, (0, asyncMiddleware_1.asyncMiddleware)(this.orderController.createOrderController.bind(this.orderController)));
        this.router.get("/", verify_1.verifyToken, verify_1.checkOutletSuper, (0, asyncMiddleware_1.asyncMiddleware)(this.orderController.getOrdersController.bind(this.orderController)));
<<<<<<< HEAD
        this.router.post("/bypass", verify_1.verifyToken, verify_1.checkSuperAdmin, this.orderController.bypassOrderController);
=======
        this.router.post("/bypass", verify_1.verifyToken, this.orderController.bypassOrderController);
>>>>>>> 67e351f8aa1f613af1c69e9ed81c6311eaa563db
    }
    getRouter() {
        return this.router;
    }
}
exports.OrderRouter = OrderRouter;
