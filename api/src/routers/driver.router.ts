import { Router } from "express";
import { RequestController } from "../controllers/driver/driver/driver.controller";

export class RequestRouter {
  private requestController: RequestController;
  private router: Router;

  constructor() {
    this.requestController = new RequestController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.patch("/", this.requestController.updateRequestStatus);
    this.router.get("/", this.requestController.getDriverHistory);
  }

  getRouter() {
    return this.router;
  }
}
