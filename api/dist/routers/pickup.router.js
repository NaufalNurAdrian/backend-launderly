"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PickupRouter = void 0;
const express_1 = require("express");
const pickup_controller_1 = require("../controllers/driver/pick up/pickup.controller");
const verify_1 = require("../middlewares/verify");
class PickupRouter {
    constructor() {
        this.pickupController = new pickup_controller_1.PickupController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", verify_1.verifyToken, (0, verify_1.verifyRoleAndAttendance)(["DRIVER"]), this.pickupController.getPickupRequest);
    }
    getRouter() {
        return this.router;
    }
}
exports.PickupRouter = PickupRouter;
