import { Request, Response } from "express";
import { getPickupRequestsService } from "../../services/pickupRequest/getPickupRequests.service.service";
import { getPickupHistoryService } from "../../services/pickupRequest/getPickupHistory.service";
import { updatePickupStatusService } from "../../services/pickupRequest/processPickup.service";

export class PickupController {
  async getPickupRequest(req: Request, res: Response) {
    try {
      const { driverId, page,sortBy, order } = req.query;
      if (!driverId) {
        res.status(400).json({ message: "Driver ID diperlukan" });
      }

      const pickupRequests = await getPickupRequestsService({
        driverId: parseInt(driverId as string),
        sortBy: sortBy as "createdAt" | "location",
        order: order as "asc" | "desc",
        page: page ? parseInt(page as string) : 1,
      });

      res.status(200).send({ data: pickupRequests });
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

      const pickupRequests = await getPickupHistoryService({
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
  } async updatePickupStatus(req: Request, res: Response) {
    try {
        const { driverId, pickupOrderId } = req.body;

        const result = await updatePickupStatusService({ driverId, pickupOrderId });

        res.status(200).json({
            message: "Status pickup order berhasil diupdate.",
            data: result,
        });
    } catch (err: any) {
        console.log(err);
        res.status(400).json({
            message: err.message,
        });
    }
}
}
