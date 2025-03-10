"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryRouter = void 0;
const express_1 = require("express");
const delivery_controller_1 = require("../controllers/driver/delivery/delivery.controller");
const verify_1 = require("../middlewares/verify");
class DeliveryRouter {
    constructor() {
        this.deliveryController = new delivery_controller_1.DeliveryController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", verify_1.verifyToken, (0, verify_1.verifyRoleAndAttendance)(["DRIVER"]), this.deliveryController.getDeliveryRequest);
    }
    getRouter() {
        return this.router;
    }
}
exports.DeliveryRouter = DeliveryRouter;
