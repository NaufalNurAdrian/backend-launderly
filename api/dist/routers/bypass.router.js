"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BypassRouter = void 0;
const verify_1 = require("../middlewares/verify");
const bypass_controller_1 = require("../controllers/worker/bypass.controller");
const express_1 = require("express");
class BypassRouter {
    constructor() {
        this.bypassController = new bypass_controller_1.BypassController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.patch("/:orderId", verify_1.verifyToken, (0, verify_1.verifyRoleAndAttendance)(["WORKER"]), this.bypassController.requestBypass);
    }
    getRouter() {
        return this.router;
    }
}
exports.BypassRouter = BypassRouter;
