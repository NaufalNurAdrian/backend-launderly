import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { verifyToken } from "../middlewares/verify";

export class NotificationRouter {
  private notificationController: NotificationController;
  private router: Router;

  constructor() {
    this.notificationController = new NotificationController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", verifyToken, this.notificationController.getNotifications);
    this.router.patch("/", this.notificationController.markNotificationAsRead);
    this.router.patch("/mark-all", verifyToken, this.notificationController.markAllNotificationAsRead);
  }

  getRouter() {
    return this.router;
  }
}
