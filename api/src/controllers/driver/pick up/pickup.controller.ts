import { Request, Response } from "express";
import { getPickupRequestsService } from "../../../services/driver/pickup/getPickupRequests.service.service";

export class PickupController {
  async getPickupRequest(req: Request, res: Response) {
    try {
      const { driverId, page, sortBy, order } = req.query;
      if (!driverId) {
        res.status(400).json({ message: "Driver ID diperlukan" });
      }

      const pickupRequests = await getPickupRequestsService({
        driverId: parseInt(driverId as string),
        sortBy: sortBy as "createdAt" | "distance",
        order: order as "asc" | "desc",
        page: page ? parseInt(page as string) : 1,
      });

      res.status(200).send(pickupRequests );
    } catch (err: any) {
      res.status(400).send({ message: err.message });
    }
  }
}
