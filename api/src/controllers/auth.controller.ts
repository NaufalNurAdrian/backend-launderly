import { Request, Response, NextFunction } from "express";
import { registerService } from "../services/auth/register.service";
import { loginService } from "../services/auth/login.service";
import { verifyService } from "../services/auth/verify.service";
import { loginGoogleService } from "../services/auth/loginGoogle.service";

export class AuthController {
  async registerController(req: Request, res: Response, next: NextFunction) {
    try {
      return registerService(req, res, next);
    } catch (error) {
      next(error);
    }
  }

  async loginController(req: Request, res: Response, next: NextFunction) {
    try {
      return loginService(req, res);
    } catch (error) {
      next(error);
    }
  }

  async verifyController(req: Request, res: Response, next: NextFunction) {
    try {
      return verifyService(req, res);
    } catch (error) {
      next(error);
    }
  }

  async getGoogleTokenController(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.body;
      const result = await loginGoogleService(code);
      res.status(200).send(result);
      return;
    } catch (error) {
      next(error);
    }
  }
}
