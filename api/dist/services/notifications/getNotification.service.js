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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserNotificationsService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const getUserNotificationsService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, sortBy, order, page = 1, pageSize = 10 } = query;
        const skip = (page - 1) * pageSize;
        const orderBy = {};
        if (sortBy === "createdAt") {
            orderBy[sortBy] = order || "desc";
        }
        const userNotifications = yield prisma_1.default.userNotification.findMany({
            where: {
                userId: userId,
                isRead: false,
            },
            include: {
                notification: true,
            },
            orderBy: orderBy,
            skip: skip,
            take: pageSize,
        });
        const totalNotifications = yield prisma_1.default.userNotification.count({
            where: {
                userId: userId,
                isRead: false,
            },
        });
        return {
            data: userNotifications,
            pagination: {
                total: totalNotifications,
                page: page,
                pageSize: pageSize,
                totalPages: Math.ceil(totalNotifications / pageSize),
            },
        };
    }
    catch (error) {
        throw error;
    }
});
exports.getUserNotificationsService = getUserNotificationsService;
