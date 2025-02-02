import { Request, Response, NextFunction } from "express";
import { getUsersId } from "../../services/user/getUserById.service";
import { resetPasswordUser } from "../../services/user/resetPassword.service";


export class UserController {
  async getUsersId(req: Request, res: Response, next: NextFunction) {
    try {
      await getUsersId(req, res);
    } catch (error) {
      next(error);
    }
  }
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await resetPasswordUser(req, res);
    } catch (error) {
      next(error);
    }
  }
}
