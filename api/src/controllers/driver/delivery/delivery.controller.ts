import { Request, Response } from "express";
import { getDeliveryRequestsService } from "../../../services/driver/delivery/getDeliveryRequests.service";

export class DeliveryController {
  async getDeliveryRequest(req: Request, res: Response) {
    try {
      const driverId = req.user?.id!;
      const { page, sortBy, order } = req.query;
      if (!driverId) {
        res.status(400).json({ message: "Driver ID diperlukan" });
      }

      const deliveryRequests = await getDeliveryRequestsService({
        driverId: driverId,
        sortBy: sortBy as "createdAt" | "distance",
        order: order as "asc" | "desc",
        page: page ? parseInt(page as string) : 1,
      });

      res.status(200).send( deliveryRequests );
    } catch (err: any) {
      console.log(err);
      res.status(400).send({ message: err.message });
    }
  }

}