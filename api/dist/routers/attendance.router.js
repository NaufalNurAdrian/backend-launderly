"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceRouter = void 0;
const express_1 = require("express");
const attendance_controller_1 = require("../controllers/attendance.controller");
const verify_1 = require("../middlewares/verify");
class AttendanceRouter {
    constructor() {
        this.attendanceController = new attendance_controller_1.AttendanceController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/history", verify_1.verifyToken, (0, verify_1.verifyRole)(["DRIVER", "WORKER"]), this.attendanceController.getAttendance);
<<<<<<< HEAD
        this.router.get("/all-history", verify_1.verifyToken, (0, verify_1.verifyRole)(["DRIVER", "WORKER"]), this.attendanceController.getAllAttendances);
=======
        this.router.get("/all-history", verify_1.verifyToken, this.attendanceController.getAllAttendances);
>>>>>>> 67e351f8aa1f613af1c69e9ed81c6311eaa563db
        this.router.post("/check-in", verify_1.verifyToken, (0, verify_1.verifyRole)(["DRIVER", "WORKER"]), this.attendanceController.checkIn);
        this.router.patch("/check-out", verify_1.verifyToken, (0, verify_1.verifyRole)(["DRIVER", "WORKER"]), this.attendanceController.checkOut);
    }
    getRouter() {
        return this.router;
    }
}
exports.AttendanceRouter = AttendanceRouter;
