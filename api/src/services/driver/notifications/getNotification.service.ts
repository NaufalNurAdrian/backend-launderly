import { Prisma } from "@prisma/client";
import prisma from "../../../prisma";

interface GetUserNotificationsQuery {
  userId: number;
  sortBy?: "createdAt";
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export const getUserNotificationsService = async (query: GetUserNotificationsQuery) => {
  try {
    const { userId, sortBy, order, page = 1, pageSize = 10 } = query;

    const skip = (page - 1) * pageSize;

    const orderBy: Prisma.UserNotificationOrderByWithRelationInput = {};
    if (sortBy === "createdAt") {
      orderBy[sortBy] = order || "desc";
    }

    const userNotifications = await prisma.userNotification.findMany({
      where: {
        userId: userId,
        isRead: false,
      },
      include: {
        notification: true,
      },
      orderBy: orderBy,
      skip: skip,
      take: pageSize,
    });

    const totalNotifications = await prisma.userNotification.count({
      where: {
        userId: userId,
        isRead: false,
      },
    });

    return {
      data: userNotifications,
      pagination: {
        total: totalNotifications,
        page: page,
        pageSize: pageSize,
        totalPages: Math.ceil(totalNotifications / pageSize),
      },
    };
  } catch (error) {
    throw error;
  }
};