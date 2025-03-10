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
        if (!user.employee || !user.employee.workShift) {
            throw new Error("Employee shift not found.");
        }
        const now = luxon_1.DateTime.now().setZone("Asia/Jakarta");
        let todayStart;
        let todayEnd;
        const checkInWIB = luxon_1.DateTime.fromJSDate(checkInTime).setZone("Asia/Jakarta");
        if (user.employee.workShift === "DAY") {
            todayStart = now.set({ hour: 6, minute: 0, second: 0, millisecond: 0 });
            todayEnd = now.set({ hour: 15, minute: 0, second: 0, millisecond: 0 });
            if (checkInWIB < todayStart || checkInWIB > todayEnd) {
                throw new Error("Check-in time is outside your shift hours (06:00 - 15:00 WIB).");
            }
        }
        else if (user.employee.workShift === "NIGHT") {
            todayStart = now.set({ hour: 15, minute: 0, second: 0, millisecond: 0 });
            todayEnd = now.set({ hour: 23, minute: 0, second: 0, millisecond: 0 });
            if (checkInWIB.toMillis() < todayStart.toMillis() || checkInWIB.toMillis() > todayEnd.toMillis()) {
                throw new Error("Check-in time is outside your shift hours (15:00 - 23:00 WIB).");
            }
        }
        else {
            throw new Error("Invalid shift");
        }
        const todayStartUTC = todayStart.toUTC().toJSDate();
        const todayEndUTC = todayEnd.toUTC().toJSDate();
        const checkInUTC = checkInWIB.toUTC().toJSDate();
        yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            const existingAttendance = yield prisma.attendance.findFirst({
                where: {
                    userId: userId,
                    checkIn: {
                        gte: todayStartUTC,
                        lte: todayEndUTC,
                    },
                },
            });
            if (existingAttendance) {
                throw new Error("You are already checked in today.");
            }
            const newAttendance = yield prisma.attendance.create({
                data: {
                    createdAt: luxon_1.DateTime.now().toUTC().toJSDate(),
                    checkIn: checkInUTC,
                    checkOut: null,
                    workHour: 0,
                    userId: userId,
                    attendanceStatus: "ACTIVE",
                },
            });
            return newAttendance;
        }));
    }
    catch (err) {
        throw err;
    }
});
exports.checkInService = checkInService;
