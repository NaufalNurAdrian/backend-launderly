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

    if (user.role !== "DRIVER" && user.role !== "WORKER") {
      throw new Error("only Driver and Worker allowed to check attendance.");
    }
    if (!user.employee || !user.employee.workShift) {
      throw new Error("Employee shift not found.");
    }

    const now = DateTime.now();
    let todayStart: Date;
    let todayEnd: Date;

    if (user.employee.workShift === "DAY") {
      // Shift DAY: 06:00 - 15:00
      todayStart = now.set({ hour: 6, minute: 0, second: 0, millisecond: 0 }).toJSDate();
      todayEnd = now.set({ hour: 15, minute: 0, second: 0, millisecond: 0 }).toJSDate();
    } else if (user.employee.workShift === "NIGHT") {
      // Shift NIGHT: 13:00 - 24:00
      todayStart = now.set({ hour: 15, minute: 0, second: 0, millisecond: 0 }).toJSDate();
      todayEnd = now.set({ hour: 24, minute: 0, second: 0, millisecond: 0 }).toJSDate();
    } else {
      throw new Error("Invalid shift.");
    }

    // const todayStart = DateTime.now().startOf("day").toJSDate();
    // const todayEnd = DateTime.now().endOf("day").toJSDate();

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
        createdAt: new Date(),
        checkIn: checkInTime,
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
