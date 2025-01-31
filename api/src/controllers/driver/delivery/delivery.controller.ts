import { Request, Response } from "express";
import { getDeliveryRequestsService } from "../../../services/driver/delivery/getDeliveryRequests.service";

export class DeliveryController {
  async getDeliveryRequest(req: Request, res: Response) {
    try {
      const { driverId, page, sortBy, order } = req.query;
      if (!driverId) {
        res.status(400).json({ message: "Driver ID diperlukan" });
      }

      const deliveryRequests = await getDeliveryRequestsService({
        driverId: parseInt(driverId as string),
        sortBy: sortBy as "createdAt" | "location",
        order: order as "asc" | "desc",
        page: page ? parseInt(page as string) : 1,
      });

      res.status(200).send({ data: deliveryRequests });
    } catch (err: any) {
      console.log(err);
      res.status(400).send({ message: err.message });
    }
  }

}
