import { verifyRoleAndAttendance } from "../middlewares/verify";
import { BypassController } from "../controllers/worker/bypass.controller";
import { Router } from "express";

export class BypassRouter {
  private bypassController: BypassController;
  private router: Router;

  constructor() {
    this.bypassController = new BypassController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.patch("/:orderId", verifyRoleAndAttendance(["WORKER"]), this.bypassController.requestBypass);
  }

  getRouter() {
    return this.router;
  }
}
