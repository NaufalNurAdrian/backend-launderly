import { registerService} from "@/services/auth/register.service";
import { Request, Response, NextFunction } from "express";

export class AuthController {
  async registerController(req: Request, res: Response) {
    try {
      const result = await registerService(req.body);

      res.status(200).send(result);
      return 
    } catch (error) {
      return
    }
  }
}
