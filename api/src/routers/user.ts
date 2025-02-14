import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { verifyToken } from "../middlewares/verify";
import { uploader } from "../utils/uploader";

export class UserRouter {
  private userController: UserController;
  private router: Router;

  constructor() {
    this.userController = new UserController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Get User by ID
    this.router.get("/profile", verifyToken,  this.userController.getUsersId);

    // Reset Password User
    this.router.patch("/reset-password", verifyToken,  this.userController.resetPassword);
    // Edit Avatar User
    this.router.patch("/edit-avatar", verifyToken,  uploader("memoryStorage", "avatarLogin-").single("avatar"), this.userController.editAvatar);
    // Update Email User
    this.router.patch("/update-email", verifyToken,  this.userController.updateEmail);
    // Confirm Email User
    this.router.patch("/verify-email", verifyToken,this.userController.verifyEmail);

    // Request Forget Password
    this.router.post("/request-forget-password",  this.userController.requestForgetPassword);
    // Confirm Forget Password
    this.router.post("/confirm-forget-password",  this.userController.confirmForgetPassword);
  }

  getRouter() {
    return this.router;
  }
}