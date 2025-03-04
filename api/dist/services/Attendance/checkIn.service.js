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
exports.checkInService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const luxon_1 = require("luxon");
const checkInService = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, checkInTime } = data;
    try {
        const user = yield prisma_1.default.user.findUnique({
            where: { id: userId },
            include: { employee: true },
        });
        if (!user) {
            throw new Error("unAuthorized.");
        }
        if (user.role !== "DRIVER" && user.role !== "WORKER") {
            throw new Error("only Driver and Worker allowed to check attendance.");
        }
        const todayStart = luxon_1.DateTime.now().startOf("day").toJSDate();
        const todayEnd = luxon_1.DateTime.now().endOf("day").toJSDate();
        const existingAttendance = yield prisma_1.default.attendance.findFirst({
            where: {
                userId: userId,
                createdAt: {
                    gte: todayStart,
                    lte: todayEnd,
                }
            },
        });
        if (existingAttendance) {
            throw new Error("You are already checked In today.");
        }
        const newAttendance = yield prisma_1.default.attendance.create({
            data: {
                createdAt: new Date(),
                checkIn: checkInTime,
                checkOut: null,
                workHour: 0,
                userId: userId,
                attendanceStatus: "ACTIVE",
            },
        });
        return newAttendance;
    }
    catch (err) {
        throw err;
    }
});
exports.checkInService = checkInService;
