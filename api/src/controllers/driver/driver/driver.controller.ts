import { Request, Response } from "express";
import { updateRequestStatusService } from "../../../services/driver/process/driverRequest.service";
import { getDriverHistoryService } from "../../../services/driver/driverHistory/getDriverHistory.service";

export class RequestController {
  async updateRequestStatus(req: Request, res: Response) {
    try {
      const driverId = req.user?.id!
      const { requestId, type } = req.body;

      const result = await updateRequestStatusService({ driverId, requestId, type });

      res.status(200).json({
        message: "status updated",
        data: result,
      });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  async getDriverHistory(req: Request, res: Response) {
    try {
      const driverId = req.user?.id!
      const { type, sortBy, order, page } = req.query;
      if (!driverId) {
        res.status(400).json({ message: "Driver ID diperlukan" });
      }

      const driverHistory = await getDriverHistoryService({
        driverId: driverId,
        sortBy: sortBy as "createdAt" | "distance",
        order: order as "asc" | "desc",
        type: type as "pickup" | "delivery",
        page: page ? parseInt(page as string) : 1,
      });

      res.status(200).send(driverHistory);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }
}