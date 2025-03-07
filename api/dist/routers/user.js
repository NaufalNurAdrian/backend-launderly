"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRouter = void 0;
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const verify_1 = require("../middlewares/verify");
const uploader_1 = require("../utils/uploader");
class UserRouter {
    constructor() {
        this.userController = new user_controller_1.UserController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Get User by ID
        this.router.get("/profile", verify_1.verifyToken, this.userController.getUsersId);
        // Reset Password User
        this.router.patch("/reset-password", verify_1.verifyToken, this.userController.resetPassword);
        // Edit Avatar User
        this.router.patch("/edit-avatar", verify_1.verifyToken, (0, uploader_1.uploader)("memoryStorage", "avatarLogin-").single("avatar"), this.userController.editAvatar);
        // Update Email User
        this.router.patch("/update-email", verify_1.verifyToken, this.userController.updateEmail);
        // Confirm Email User
        this.router.patch("/verify-email", verify_1.verifyToken, this.userController.verifyEmail);
        // Confirm Order
<<<<<<< HEAD
        this.router.patch("/confirm-order", verify_1.verifyToken, this.userController.confirmOrder);
=======
        this.router.patch("/confirm-order", this.userController.confirmOrder);
>>>>>>> 67e351f8aa1f613af1c69e9ed81c6311eaa563db
        // Confirm Forget Password
        this.router.patch("/confirm-forget-password", this.userController.confirmForgetPassword);
        // Request Forget Password
        this.router.post("/request-forget-password", this.userController.requestForgetPassword);
    }
    getRouter() {
        return this.router;
    }
}
exports.UserRouter = UserRouter;
