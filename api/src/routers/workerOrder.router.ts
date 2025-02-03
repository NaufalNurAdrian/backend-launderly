import { Router } from "express";
import { OrderWorkerController } from "../controllers/worker/workerOrder.controller";

export class OrderWorkerRouter {
    private orderWorkerController : OrderWorkerController
  private router: Router;

  constructor() {
    this.orderWorkerController = new OrderWorkerController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.orderWorkerController.getOrderController);
  }

  getRouter() {
    return this.router;
  }
}
