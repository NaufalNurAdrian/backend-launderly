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
exports.createNotificationForNextStation = void 0;
const client_1 = require("prisma/generated/client");
const prisma_1 = __importDefault(require("../../prisma"));
const createNotificationForNextStation = (orderId, nextStation) => __awaiter(void 0, void 0, void 0, function* () {
    const usersInNextStation = yield prisma_1.default.employee.findMany({
        where: {
            station: {
                equals: client_1.EmployeeStation.WASHING,
                not: null,
            },
        },
        select: { userId: true },
    });
    if (usersInNextStation.length === 0) {
        console.warn(`No employees found for station: ${nextStation}`);
        return;
    }
    const notification = yield prisma_1.default.notification.create({
        data: {
            title: `Incoming order`,
            description: `The order is ready to be processed at the ${nextStation.toLowerCase()} station.`,
        },
    });
    for (const user of usersInNextStation) {
        yield prisma_1.default.userNotification.create({
            data: {
                userId: user.userId,
                notificationId: notification.id,
            },
        });
    }
});
exports.createNotificationForNextStation = createNotificationForNextStation;
