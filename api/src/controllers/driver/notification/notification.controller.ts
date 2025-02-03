import { Request, Response } from "express";
import { getUserNotificationsService } from "../../../services/driver/notifications/getNotification.service";
import { markNotificationAsReadService } from "../../../services/driver/notifications/updateNotification.service";
import { markAllNotificationAsReadService } from "../../../services/driver/notifications/updateAllNotification.service";

export class NotificationController {
  async getNotifications(req: Request, res: Response) {
    try {
      const { userId, sortBy, order, page } = req.query;
      const notifications = await getUserNotificationsService({
        userId: parseInt(userId as string),
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
    const { notificationId } = req.query;

    try {
      const updatedNotification = await markNotificationAsReadService(Number(notificationId));
      res.status(200).json({
        message: "Notification marked as read",
        data: updatedNotification,
      });
      res.status(200).send({message: "notification read", updatedNotification})
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }
  async markAllNotificationAsRead(req: Request, res: Response) {
    const { userId } = req.query;

    try {
      const updatedNotification = await markAllNotificationAsReadService(Number(userId));
      res.status(200).json({
        message: "Notification marked as read",
        data: updatedNotification,
      });
      res.status(200).send({message: "notification read", updatedNotification})
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }
}
