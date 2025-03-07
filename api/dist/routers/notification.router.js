"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRouter = void 0;
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const verify_1 = require("../middlewares/verify");
class NotificationRouter {
    constructor() {
        this.notificationController = new notification_controller_1.NotificationController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", verify_1.verifyToken, this.notificationController.getNotifications);
        this.router.patch("/", verify_1.verifyToken, this.notificationController.markNotificationAsRead);
        this.router.patch("/mark-all", verify_1.verifyToken, this.notificationController.markAllNotificationAsRead);
    }
    getRouter() {
        return this.router;
    }
}
exports.NotificationRouter = NotificationRouter;
