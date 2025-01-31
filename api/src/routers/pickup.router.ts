import { Router } from "express";
import { PickupController } from "../controllers/driver/pick up/pickup.controller";

export class PickupRouter {
  private pickupController: PickupController;
  private router: Router;

  constructor() {
    this.pickupController = new PickupController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.pickupController.getPickupRequest);
  }

  getRouter() {
    return this.router;
  }
}
