import { getPickupRequestsService } from "../../../services/driver/getPickupRequests.service.service";
import { Request, Response } from "express";

export class PickupController {
  async getPickupRequest(req: Request, res: Response) {
    try {
      const driverId = req.user?.id!;
      const { page, sortBy, order } = req.query;

      const pickupRequests = await getPickupRequestsService({
        driverId: driverId,
        sortBy: sortBy as "createdAt" | "distance",
        order: order as "asc" | "desc",
        page: page ? parseInt(page as string) : 1,
      });

      res.status(200).send(pickupRequests);
    } catch (err: any) {
      res.status(400).send({ message: err.message });
    }
  }
}
