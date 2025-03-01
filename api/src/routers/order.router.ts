import { OrderController } from "../controllers/order.controller";
import { checkOutletSuper, checkSuperAdmin, verifyToken } from "../middlewares/verify";
import { asyncMiddleware } from "../middlewares/asyncMiddleware";
import { Router } from "express";

export class OrderRouter {
  private orderController: OrderController;
  private router: Router;

  constructor() {
    this.orderController = new OrderController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/create",
      verifyToken,
      checkSuperAdmin,
      asyncMiddleware(this.orderController.createOrderController.bind(this.orderController))
    );
    this.router.get(
      "/",
      verifyToken,
      checkOutletSuper,
      asyncMiddleware(this.orderController.getOrdersController.bind(this.orderController))
    );
    this.router.post("/bypass", verifyToken, checkSuperAdmin, this.orderController.bypassOrderController)
  }

  getRouter() {
    return this.router;
  }
}
