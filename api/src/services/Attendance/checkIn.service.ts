import prisma from "../../prisma";
import { DateTime } from "luxon";

interface CheckInData {
  userId: number;
  checkInTime: Date;
}

export const checkInService = async (data: CheckInData) => {
  const { userId, checkInTime } = data;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employee: true },
    });

    if (!user) {
      throw new Error("unAuthorized.");
    }

    if (!user.employee || !user.employee.workShift) {
      throw new Error("Employee shift not found.");
    }

    const now = DateTime.now().setZone("Asia/Jakarta");
    let todayStart: Date;
    let todayEnd: Date;

    const checkInWIB = DateTime.fromJSDate(checkInTime).setZone("Asia/Jakarta").toJSDate();

    if (user.employee.workShift === "DAY") {
      todayStart = now.set({ hour: 6, minute: 0, second: 0, millisecond: 0 }).toJSDate();
      todayEnd = now.set({ hour: 15, minute: 0, second: 0, millisecond: 0 }).toJSDate();

      if (checkInWIB < todayStart || checkInWIB > todayEnd) {
        throw new Error("Check-in time is outside your shift hours (06:00 - 15:00).");
      }
    } else if (user.employee.workShift === "NIGHT") {
      todayStart = now.set({ hour: 15, minute: 0, second: 0, millisecond: 0 }).toJSDate();
      todayEnd = now.set({ hour: 23, minute: 0, second: 0, millisecond: 0 }).toJSDate();

      if (checkInWIB < todayStart || checkInWIB > todayEnd) {
        throw new Error("Check-in time is outside your shift hours (15:00 - 23:00).");
      }
    } else {
      throw new Error("Invalid shift");
    }

    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId: userId,
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    if (existingAttendance) {
      throw new Error("You are already checked In today.");
    }

    const newAttendance = await prisma.attendance.create({
      data: {
        createdAt: now.toJSDate(),
        checkIn: checkInWIB,
        checkOut: null,
        workHour: 0,
        userId: userId,
        attendanceStatus: "ACTIVE",
      },
    });

    return newAttendance;
  } catch (err) {
    throw err;
  }
};