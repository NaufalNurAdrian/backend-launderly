import { Router } from "express";
import { RequestController } from "../controllers/driver/driver/driver.controller";
import { verifyRole, verifyRoleAndAttendance, verifyToken } from "../middlewares/verify";

export class RequestRouter {
  private requestController: RequestController;
  private router: Router;

  constructor() {
    this.requestController = new RequestController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.patch("/",verifyToken, verifyRoleAndAttendance(["DRIVER"]),  this.requestController.updateRequestStatus);
    this.router.get("/",verifyToken, verifyRole(["DRIVER"]), this.requestController.getDriverHistory);
  }

  getRouter() {
    return this.router;
  }
}
