import prisma from "../../../prisma";

export const markNotificationAsReadService = async (notificationId: number) => {
  try {
    const updatedNotification = await prisma.userNotification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return updatedNotification;
  } catch (error) {
    throw error;
  }
};

