import { Router } from "express";
import { OutletController } from "../controllers/outlet.controller";
import { checkSuperAdmin, verifyToken } from "../middlewares/verify";

export class OutletRouter {
  private outletController: OutletController;
  private router: Router;

  constructor() {
    this.outletController = new OutletController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/create",
      verifyToken,
      checkSuperAdmin,
      this.outletController.createOutletController
    );
    this.router.get("/", verifyToken, checkSuperAdmin, this.outletController.getAllOutlet)
    this.router.patch("/update/", verifyToken, checkSuperAdmin, this.outletController.updateOutlet)
    this.router.patch("/delete", verifyToken, checkSuperAdmin, this.outletController.deleteOutlet)
    this.router.get("/:id", verifyToken, checkSuperAdmin, this.outletController.getOutletById)
  }
  

  getRouter() {
    return this.router;
  }
}
