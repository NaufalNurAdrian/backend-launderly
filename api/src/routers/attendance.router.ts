import { Router } from "express"
import { AttendanceController } from "../controllers/attendance.controller";

export class AttendanceRouter{
    private attendanceController: AttendanceController
    private router: Router

    constructor() {
        this.attendanceController = new AttendanceController()
        this.router = Router()
        this.initializeRoutes()
    }

    private initializeRoutes() {
      this.router.get('/history/:userId', this.attendanceController.getAttendance)
      this.router.get('/all-history', this.attendanceController.getAllAttendances)
      this.router.post('/check-in', this.attendanceController.checkIn)
      this.router.patch('/check-out', this.attendanceController.checkOut)
    }

    getRouter() : Router {
        return this.router
    }
}