import { AuthController } from "@/controllers/user/auth.controller";
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
    this.router.post(
      '/register',
      this.authController.registerController,
    );
  }

  getRouter() {
    return this.router;
  }
}
