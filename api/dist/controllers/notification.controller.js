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
exports.NotificationController = void 0;
const getNotification_service_1 = require("../services/notifications/getNotification.service");
const updateNotification_service_1 = require("../services/notifications/updateNotification.service");
const updateAllNotification_service_1 = require("../services/notifications/updateAllNotification.service");
class NotificationController {
    getNotifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { sortBy, order, page } = req.query;
                const notifications = yield (0, getNotification_service_1.getUserNotificationsService)({
                    userId: userId,
                    sortBy: sortBy,
                    order: order,
                    page: page ? parseInt(page) : 1,
                });
                res.status(200).send(notifications);
            }
            catch (err) {
                res.status(400).json({ message: err.message });
            }
        });
    }
    markNotificationAsRead(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { notificationId } = req.query;
            try {
                const updatedNotification = yield (0, updateNotification_service_1.markNotificationAsReadService)({
                    userId: userId,
                    notificationId: +notificationId,
                });
                res.status(200).json({
                    message: "Notification marked as read",
                    data: updatedNotification,
                });
            }
            catch (err) {
                res.status(400).json({ message: err.message });
            }
        });
    }
    markAllNotificationAsRead(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            try {
                const updatedNotification = yield (0, updateAllNotification_service_1.markAllNotificationAsReadService)(Number(userId));
                res.status(200).json({
                    message: "Notification marked as read",
                    data: updatedNotification,
                });
            }
            catch (err) {
                res.status(400).json({ message: err.message });
            }
        });
    }
}
exports.NotificationController = NotificationController;
