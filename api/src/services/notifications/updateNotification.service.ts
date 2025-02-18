import prisma from "../../prisma";

interface editNotificationsQuery {
  userId: number;
  notificationId: number;
}

export const markNotificationAsReadService = async ({userId, notificationId} : editNotificationsQuery) => {
  try {
    const updatedNotification = await prisma.userNotification.update({
      where: { id: notificationId, userId: userId },
      data: { isRead: true },
    });

    return updatedNotification;
  } catch (error) {
    throw error;
  }
};
