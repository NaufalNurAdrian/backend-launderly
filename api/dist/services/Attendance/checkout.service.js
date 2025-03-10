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
exports.checkOutService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const luxon_1 = require("luxon");
const checkOutService = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, checkOutTime } = data;
    try {
        const todayStart = luxon_1.DateTime.now().startOf("day").toJSDate();
        const todayEnd = luxon_1.DateTime.now().endOf("day").toJSDate();
        const existingAttendance = yield prisma_1.default.attendance.findFirst({
            where: {
                userId: userId,
                createdAt: {
                    gte: todayStart,
                    lte: todayEnd,
                },
                checkOut: null,
            },
        });
        if (!existingAttendance) {
            throw new Error("There is no attendance, or you are already checked out.");
        }
        const checkInTime = existingAttendance.checkIn;
        const workHour = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
        const updatedAttendance = yield prisma_1.default.attendance.update({
            where: { id: existingAttendance.id },
            data: {
                checkOut: checkOutTime,
                workHour: workHour,
                attendanceStatus: "INACTIVE",
            },
        });
        return updatedAttendance;
    }
    catch (err) {
        throw err;
    }
});
exports.checkOutService = checkOutService;
