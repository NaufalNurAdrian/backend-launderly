import { PickupOrderController } from "../controllers/pickupOrder.controller";
import { verifyToken } from "../middlewares/verify";
import { Router } from "express";

export class PickupOrderRouter {
  private router: Router;
  private pickupOrderController: PickupOrderController;

  constructor() {
    this.pickupOrderController = new PickupOrderController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/",
      verifyToken,
      this.pickupOrderController.getPickupOrdersController
    );
    this.router.get(
      "/:id",
      verifyToken,
      this.pickupOrderController.getPickupOrderController
    );
    this.router.post(
      "/",
      verifyToken,
      this.pickupOrderController.createPickupOrderController
    );
    this.router.patch(
      "/",
      verifyToken,
      this.pickupOrderController.updatePickupOrderController
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
