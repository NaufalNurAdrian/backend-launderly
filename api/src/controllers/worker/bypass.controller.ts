import { createBypass } from "../../services/worker/bypass/createBypass.service";
import { Request, Response } from "express";

export class BypassController {
  async requestBypass(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const { workerId } = req.query;
      const { bypassNote } = req.body;

      const result = await createBypass({
        workerId: parseInt(workerId as string),
        orderId: parseInt(orderId as string),
        bypassNote: bypassNote
      });

      res.status(200).send({message:"bypass requested", data: result});
    } catch (error: any) {
      res.status(400).send({ message: error.message });
    }
  }
}
