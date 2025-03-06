import { EmployeeStation, Prisma } from "@prisma/client";
import prisma from "../../prisma";

export const createNotificationForNextStation = async (
  orderId: number,
  nextStation: string
) => {
  const usersInNextStation = await prisma.employee.findMany({
    where: {
      station: {
        equals: EmployeeStation.WASHING,
        not: null,
      },
    },
    select: { userId: true },
  });

  if (usersInNextStation.length === 0) {
    console.warn(`No employees found for station: ${nextStation}`);
    return;
  }

  const notification = await prisma.notification.create({
    data: {
      title: `Incoming order`,
      description: `The order is ready to be processed at the ${nextStation.toLowerCase()} station.`,
    },
  });

  for (const user of usersInNextStation) {
    await prisma.userNotification.create({
      data: {
        userId: user.userId,
        notificationId: notification.id,
      },
    });
  }
};
