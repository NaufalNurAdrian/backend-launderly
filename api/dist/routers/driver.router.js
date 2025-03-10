"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestRouter = void 0;
const express_1 = require("express");
const driver_controller_1 = require("../controllers/driver/driver/driver.controller");
const verify_1 = require("../middlewares/verify");
class RequestRouter {
    constructor() {
        this.requestController = new driver_controller_1.RequestController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.patch("/", verify_1.verifyToken, (0, verify_1.verifyRoleAndAttendance)(["DRIVER"]), this.requestController.updateRequestStatus);
        this.router.get("/", verify_1.verifyToken, (0, verify_1.verifyRole)(["DRIVER"]), this.requestController.getDriverHistory);
    }
    getRouter() {
        return this.router;
    }
}
exports.RequestRouter = RequestRouter;
