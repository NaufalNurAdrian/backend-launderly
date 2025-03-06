import { Router } from "express";
import { AttendanceController } from "../controllers/attendance.controller";
import { checkOutletSuper, verifyRole, verifyToken } from "../middlewares/verify";

export class AttendanceRouter {
  private attendanceController: AttendanceController;
  private router: Router;

  constructor() {
    this.attendanceController = new AttendanceController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/history", verifyToken, verifyRole(["DRIVER", "WORKER"]), this.attendanceController.getAttendance);
    this.router.get("/all-history", verifyToken, checkOutletSuper, this.attendanceController.getAllAttendances);
    this.router.post("/check-in", verifyToken, verifyRole(["DRIVER", "WORKER"]), this.attendanceController.checkIn);
    this.router.patch("/check-out", verifyToken, verifyRole(["DRIVER", "WORKER"]), this.attendanceController.checkOut);
  }

  getRouter(): Router {
    return this.router;
  }
}
