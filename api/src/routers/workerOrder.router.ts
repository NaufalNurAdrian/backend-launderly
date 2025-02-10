import { Router } from "express";
import { OrderWorkerController } from "../controllers/worker/workerOrder.controller";
import { verifyRole, verifyRoleAndAttendance, verifyToken } from "../middlewares/verify";

export class OrderWorkerRouter {
    private orderWorkerController : OrderWorkerController
  private router: Router;

  constructor() {
    this.orderWorkerController = new OrderWorkerController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/",　verifyToken, verifyRoleAndAttendance(["WORKER"]), this.orderWorkerController.getOrders);
    this.router.get("/history", 　verifyToken, verifyRole(["WORKER"]), this.orderWorkerController.getOrderHistory);
    this.router.get("/orders/:orderId", 　verifyToken, verifyRoleAndAttendance(["WORKER"]), this.orderWorkerController.getOrderItem);
    this.router.post("/create/:orderId",　verifyToken, verifyRoleAndAttendance(["WORKER"]),  this.orderWorkerController.createOrderWorker);
    this.router.patch("/complete/:orderId", 　verifyToken, verifyRoleAndAttendance(["WORKER"]), this.orderWorkerController.finishOrderWorker);
  }

  getRouter() {
    return this.router;
  }
}