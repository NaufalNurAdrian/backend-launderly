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
exports.AttendanceController = void 0;
const getAttendance_service_1 = require("../services/Attendance/getAttendance.service");
const getAllAttendances_service_1 = require("../services/Attendance/getAllAttendances.service");
const checkIn_service_1 = require("../services/Attendance/checkIn.service");
const checkout_service_1 = require("../services/Attendance/checkout.service");
class AttendanceController {
    getAttendance(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { sortBy, order, page } = req.query;
                const attendance = yield (0, getAttendance_service_1.getAttendancesService)({
                    userId: userId,
                    sortBy: sortBy,
                    order: order,
                    page: page ? parseInt(page) : 1,
                });
                res.status(200).send(attendance);
            }
            catch (err) {
                res.status(400).send({ message: err });
            }
        });
    }
    getAllAttendances(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { outletId, sortBy, order, page, role } = req.query;
                const attendances = yield (0, getAllAttendances_service_1.getAllAttendancesService)({
                    userId: userId,
                    outletId: outletId ? parseInt(outletId) : undefined,
                    sortBy: sortBy,
                    order: order,
                    page: page ? parseInt(page) : 1,
                    role: role,
                });
                res.status(200).send(attendances);
            }
            catch (err) {
                res.status(400).send({ message: err });
            }
        });
    }
    checkIn(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const checkInTime = new Date();
                const result = yield (0, checkIn_service_1.checkInService)({ userId, checkInTime });
                res.status(200).json({
                    message: "Check-in berhasil.",
                    data: result,
                });
            }
            catch (err) {
                res.status(400).send({ message: err });
            }
        });
    }
    checkOut(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const checkOutTime = new Date();
                const result = yield (0, checkout_service_1.checkOutService)({ userId, checkOutTime });
                res.status(200).json({
                    message: "Check-out berhasil.",
                    data: result,
                });
            }
            catch (err) {
                res.status(400).send({ message: err });
            }
        });
    }
}
exports.AttendanceController = AttendanceController;
