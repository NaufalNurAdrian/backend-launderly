import { Request, Response } from "express";
import { getAttendancesService } from "../services/Attendance/getAttendance.service";
import { getAllAttendancesService } from "../services/Attendance/getAllAttendances.service";
import { checkInService } from "../services/Attendance/checkIn.service";
import { checkOutService } from "../services/Attendance/checkout.service";

export class AttendanceController {
  async getAttendance(req: Request, res: Response) {
    try {
      const userId = req.user?.id!;
      const { sortBy, order, page } = req.query;

      const attendance = await getAttendancesService({
        userId: userId,
        sortBy: sortBy as "createdAt" | "workHour",
        order: order as "asc" | "desc",
        page: page ? parseInt(page as string) : 1,
      });

      res.status(200).send(attendance);
    } catch (err: any) {
      res.status(400).send({ message: err });
    }
  }

  async getAllAttendances(req: Request, res: Response) {
    try {
      const userId = req.user?.id!;
      const { outletId, sortBy, order, page, role } = req.query;

      const attendances = await getAllAttendancesService({
        userId: userId,
        outletId: outletId ? parseInt(outletId as string) : undefined,
        sortBy: sortBy as "createdAt" | "workHour",
        order: order as "asc" | "desc",
        page: page ? parseInt(page as string) : 1,
        role: role as "WORKER" | "DRIVER",
      });

      res.status(200).send(attendances);
    } catch (err: any) {
      res.status(400).send({ message: err });
    }
  }

  async checkIn(req: Request, res: Response) {
    try {
      const userId = req.user?.id!;
      const checkInTime = new Date();

      const result = await checkInService({ userId, checkInTime });

      res.status(200).json({
        message: "Check-in berhasil.",
        data: result,
      });
    } catch (err: any) {
      res.status(400).send({ message: err });
    }
  }

  async checkOut(req: Request, res: Response) {
    try {
      const userId = req.user?.id!;
      const checkOutTime = new Date();

      const result = await checkOutService({ userId, checkOutTime });

      res.status(200).json({
        message: "Check-out berhasil.",
        data: result,
      });
    } catch (err: any) {
      res.status(400).send({ message: err });
    }
  }
}
