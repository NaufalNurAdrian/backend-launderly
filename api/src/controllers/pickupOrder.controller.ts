import { Request, Response, NextFunction } from "express";
import { createOrderPickupOrderService } from "../services/pickupOrder/createPickupOrder.service";
import { getPickupOrdersService } from "../services/pickupOrder/getPickupOrders.service";
import { updatePickupOrderService } from "../services/pickupOrder/updatePickupOrder.service";
import { getNearbyOutletsService } from "../services/pickupOrder/getNearbyOutletservice";
import { getPickupOrderService } from "../services/pickupOrder/getPickupOrder.service";


export class PickupOrderController {
  async getPickupOrdersController(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const query = {
        id: Number(res.locals.user.id), // Pastikan id valid
        pickupStatus: (req.query.pickupStatus as string) || "all",
        isOrderCreated: Number(req.query.isOrderCreated) || 0,
        isClaimedbyDriver: Number(req.query.isClaimedbyDriver) || 0,
        latitude: req.query.latitude ? Number(req.query.latitude) : undefined,
        longitude: req.query.longitude
          ? Number(req.query.longitude)
          : undefined,
        take: Number(req.query.take) || 10, // Beri batas default yang masuk akal
        page: Number(req.query.page) || 1,
        sortBy: (req.query.sortBy as string) || "createdAt",
        sortOrder: (req.query.sortOrder as string) === "desc" ? "desc" : "asc",
      };

      const result = await getPickupOrdersService(query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getPickupOrderController(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = req.params.id;
      const result = await getPickupOrderService(Number(id));
      res.status(200).send(result);
      return;
    } catch (error) {
      next(error);
    }
  }

  async updatePickupOrderController(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await updatePickupOrderService(req.body);
      res.status(200).send(result);
      return;
    } catch (error) {
      next(error);
    }
  }

  async createPickupOrderController(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await createOrderPickupOrderService(req.body);
      res.status(200).send(result);
      return;
    } catch (error) {
      next(error);
    }
  }

  async getOutletNearbyController(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { latitude, longitude } = req.query;

      if (!latitude || !longitude) {
        res
          .status(400)
          .json({ message: "Latitude and longitude are required" });
        return;
      }

      // Pastikan nilai query string diubah ke number
      const lat = Number(latitude);
      const lon = Number(longitude);

      if (isNaN(lat) || isNaN(lon)) {
        res
          .status(400)
          .json({ message: "Invalid latitude or longitude format" });
        return;
      }

      // Panggil service yang telah diperbaiki
      const result = await getNearbyOutletsService(lat, lon);

      res.status(200).json({
        message: "Nearby outlets retrieved successfully",
        nearbyOutlets: result,
      });
      return;
    } catch (error) {
      next(error);
    }
  }
}
