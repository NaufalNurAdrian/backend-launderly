import { Request, Response } from "express";
import { getDeliveryRequestsService } from "../../services/delivery/getDeliveryRequests.service";
import { getDeliveryHistoryService } from "../../services/delivery/getDeliveryHitory.service";

export class DeliveryController {
  async getDeliveryRequest(req: Request, res: Response) {
    try {
      const { driverId, page,sortBy, order } = req.query;
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

  async getPickupHistory(req: Request, res: Response){
    try{
      const { driverId, page,sortBy, order } = req.query;
      if (!driverId) {
        res.status(400).json({ message: "Driver ID diperlukan" });
      }

      const pickupRequests = await getDeliveryHistoryService({
        driverId: parseInt(driverId as string),
        sortBy: sortBy as "createdAt" | "location",
        order: order as "asc" | "desc",
        page: page ? parseInt(page as string) : 1,
      });

      res.status(200).send({ data: pickupRequests });
    }catch (err: any) {
      console.log(err);
      res.status(400).send({ message: err.message });
    }
  }
}
