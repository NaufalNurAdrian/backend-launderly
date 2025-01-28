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

        const todayStart = DateTime.now().startOf("day").toJSDate(); // Awal hari ini
        const todayEnd = DateTime.now().endOf("day").toJSDate(); // Akhir hari ini

        const existingAttendance = await prisma.attendance.findFirst({
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