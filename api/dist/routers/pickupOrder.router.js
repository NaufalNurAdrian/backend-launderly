"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PickupOrderRouter = void 0;
const pickupOrder_controller_1 = require("../controllers/pickupOrder.controller");
const verify_1 = require("../middlewares/verify");
const express_1 = require("express");
class PickupOrderRouter {
    constructor() {
        this.pickupOrderController = new pickupOrder_controller_1.PickupOrderController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", verify_1.verifyToken, this.pickupOrderController.getPickupOrdersController);
        this.router.get("/nearby-outlet", verify_1.verifyToken, this.pickupOrderController.getOutletNearbyController);
        this.router.post("/", verify_1.verifyToken, this.pickupOrderController.createPickupOrderController);
        this.router.patch("/", verify_1.verifyToken, this.pickupOrderController.updatePickupOrderController);
        this.router.get("/:id", verify_1.verifyToken, this.pickupOrderController.getUserOrdersController);
    }
    getRouter() {
        return this.router;
    }
}
exports.PickupOrderRouter = PickupOrderRouter;
