import { Router } from "express";
import { UserController } from "../controllers/user/user.controller";
import { verifyToken } from "../middlewares/verify";

export class UserRouter {
  private userController: UserController;
  private router: Router;

  constructor() {
    this.userController = new UserController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/profile", verifyToken, this.userController.getUsersId);
    this.router.patch("/resetpassword", verifyToken, this.userController.resetPassword);
  }

  getRouter() {
    return this.router;
  }
}
