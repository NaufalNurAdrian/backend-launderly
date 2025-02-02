import prisma from "../../prisma";
import { DateTime } from "luxon";

interface CheckOutData {
    userId: number; 
    checkOutTime: Date; 
}

export const checkOutService = async (data: CheckOutData) => {
    const { userId, checkOutTime } = data;

    try {
        const todayStart = DateTime.now().startOf("day").toJSDate(); 
        const todayEnd = DateTime.now().endOf("day").toJSDate(); 

        const existingAttendance = await prisma.attendance.findFirst({
            where: {
                userId: userId,
                createdAt: {
                    gte: todayStart, 
                    lte: todayEnd,
                },
                checkOut: null,
            },
        });

        if (!existingAttendance) {
            throw new Error("There is no attendance, or you are already checked out.");
        }

        const checkInTime = existingAttendance.checkIn;
        const workHour = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

        const updatedAttendance = await prisma.attendance.update({
            where: { id: existingAttendance.id },
            data: {
                checkOut: checkOutTime,
                workHour: workHour,
                attendanceStatus: "INACTIVE",
            },
        });

        return updatedAttendance;
    } catch (err) {
        throw err;
    }
};