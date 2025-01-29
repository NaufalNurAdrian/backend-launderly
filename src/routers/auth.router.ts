import { AuthController } from "../controllers/auth/auth.controller";
import { Router } from "express";

export class AuthRouter {
  private authController: AuthController;
  private router: Router;

  constructor() {
    this.authController = new AuthController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/register", this.authController.registerController);
    this.router.post("/login", this.authController.loginController);
    this.router.patch(
      "/verify/customers/:token",
      this.authController.verifyController
    );
  }

  getRouter() {
    return this.router;
  }
}
