import { Request, Response } from "express";
import { getUserNotificationsService } from "../services/notifications/getNotification.service";
import { markNotificationAsReadService } from "../services/notifications/updateNotification.service";
import { markAllNotificationAsReadService } from "../services/notifications/updateAllNotification.service";

export class NotificationController {
  async getNotifications(req: Request, res: Response) {
    try {
      const userId = req.user?.id!;
      const { sortBy, order, page } = req.query;
      const notifications = await getUserNotificationsService({
        userId: userId,
        sortBy: sortBy as "createdAt",
        order: order as "desc" | "asc",
        page: page ? parseInt(page as string) : 1,
      });
      res.status(200).send(notifications);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  async markNotificationAsRead(req: Request, res: Response) {
    const userId = req.user?.id!;
    const { notificationId } = req.query;

    try {
      const updatedNotification = await markNotificationAsReadService({
        userId: userId,
        notificationId: +notificationId!,
      });
      res.status(200).json({
        message: "Notification marked as read",
        data: updatedNotification,
      });
      res.status(200).send({ message: "notification read", updatedNotification });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }
  async markAllNotificationAsRead(req: Request, res: Response) {
    const userId = req.user?.id!;

    try {
      const updatedNotification = await markAllNotificationAsReadService(Number(userId));
      res.status(200).json({
        message: "Notification marked as read",
        data: updatedNotification,
      });
      res.status(200).send({ message: "notification read", updatedNotification });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }
}
