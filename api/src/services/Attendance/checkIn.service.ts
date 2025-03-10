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

    let todayStart: DateTime;
    let todayEnd: DateTime;

    const checkInWIB = DateTime.fromJSDate(checkInTime).setZone("Asia/Jakarta", { keepLocalTime: true });

    if (user.employee.workShift === "DAY") {
      todayStart = now.set({ hour: 6, minute: 0, second: 0, millisecond: 0 });
      todayEnd = now.set({ hour: 15, minute: 0, second: 0, millisecond: 0 });

      if (checkInWIB < todayStart || checkInWIB > todayEnd) {
        throw new Error("Check-in time is outside your shift hours (06:00 - 15:00 WIB).");
      }
    } else if (user.employee.workShift === "NIGHT") {
      todayStart = now.set({ hour: 15, minute: 0, second: 0, millisecond: 0 });
      todayEnd = now.set({ hour: 23, minute: 0, second: 0, millisecond: 0 });

      if (checkInWIB < todayStart || checkInWIB > todayEnd) {
        throw new Error("Check-in time is outside your shift hours (15:00 - 23:00 WIB).");
      }
    } else {
      throw new Error("Invalid shift");
    }

    const todayStartUTC = todayStart.toUTC().toJSDate();
    const todayEndUTC = todayEnd.toUTC().toJSDate();
    const checkInUTC = checkInWIB.toUTC().toJSDate();

    await prisma.$transaction(async (prisma) => {
      const existingAttendance = await prisma.attendance.findFirst({
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

      const newAttendance = await prisma.attendance.create({
        data: {
          createdAt: DateTime.now().toUTC().toJSDate(),
          checkIn: checkInUTC,
          checkOut: null,
          workHour: 0,
          userId: userId,
          attendanceStatus: "ACTIVE",
        },
      });

      return newAttendance;
    });
  } catch (err) {
    throw err;
  }
};
