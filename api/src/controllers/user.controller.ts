import { Request, Response, NextFunction } from "express";
import { getUsersIdService } from "../services/user/getUserById.service";
import { resetPasswordUserService } from "../services/user/resetPassword.service";
import { editAvatarService } from "../services/user/editAvatar.service";
import { updateEmailService } from "../services/user/emailUpdate.service";
import { verifyEmailService } from "../services/user/emailVerify.service";
import { requestForgetPasswordService } from "../services/user/forgetRequestPassword.service";
import { confirmForgetPasswordService } from "../services/user/forgetConfirmPassword.service";
import { confirmOrderService } from "@/services/user/confirmOrder.service";

export class UserController {
  async getUsersId(req: Request, res: Response, next: NextFunction) {
    try {
      await getUsersIdService(req, res);
    } catch (error) {
      next(error);
    }
  }
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await resetPasswordUserService(req, res);
    } catch (error) {
      next(error);
    }
  }

  async editAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      await editAvatarService(req, res);
    } catch (error) {
      next(error);
    }
  }
  async updateEmail(req: Request, res: Response, next: NextFunction) {
    try {
      await updateEmailService(req, res);
    } catch (error) {
      next(error);
    }
  }
  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      await verifyEmailService(req, res);
    } catch (error) {
      next(error);
    }
  }
  async requestForgetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await requestForgetPasswordService(req, res);
    } catch (error) {
      next(error);
    }
  }
  async confirmForgetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await confirmForgetPasswordService(req, res);
    } catch (error) {
      next(error);
    }
  }
  async confirmOrder(req: Request, res: Response, next: NextFunction) {
    try {
      await confirmOrderService(req, res);
    } catch (error) {
      next(error);
    }
  }
}
