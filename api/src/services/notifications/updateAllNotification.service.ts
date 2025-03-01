import prisma from "../../prisma";

export const markAllNotificationAsReadService = async (userId: number) => {
  try {
    const updatedNotification = await prisma.userNotification.updateMany({
      where: { userId: userId },
      data: { isRead: true },
    });

    return updatedNotification;
  } catch (error) {
    throw error;
  }
};
