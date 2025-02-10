import { Router } from "express";
import { DeliveryController } from "../controllers/driver/delivery/delivery.controller";
import { verifyRoleAndAttendance, verifyToken } from "../middlewares/verify";

export class DeliveryRouter {
  private deliveryController: DeliveryController;
  private router: Router;

  constructor() {
    this.deliveryController = new DeliveryController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/",verifyToken, verifyRoleAndAttendance(["DRIVER"]),  this.deliveryController.getDeliveryRequest);
  }

  getRouter() {
    return this.router;
  }
}
