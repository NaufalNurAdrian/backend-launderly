import { ItemController } from "../controllers/item.controller";
import { checkSuperAdmin, verifyToken } from "../middlewares/verify";
import { Router } from "express";

export class ItemRouter {
  private itemController: ItemController;
  private router: Router;

  constructor() {
    this.itemController = new ItemController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/create", verifyToken, checkSuperAdmin, this.itemController.createItemController)
    this.router.get("/", verifyToken, checkSuperAdmin, this.itemController.getItemController)
  }

  getRouter() {
    return this.router;
  }
}
