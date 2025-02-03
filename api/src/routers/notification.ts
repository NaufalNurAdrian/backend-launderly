import { Router } from "express";
import { NotificationController } from "../controllers/driver/notification/notification.controller";

export class NotificationRouter {
  private notificationController: NotificationController;
  private router: Router;

  constructor() {
    this.notificationController = new NotificationController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.notificationController.getNotifications);
    this.router.patch("/", this.notificationController.markNotificationAsRead);
    this.router.patch("/mark-all", this.notificationController.markAllNotificationAsRead);
  }

  getRouter() {
    return this.router;
  }
}
