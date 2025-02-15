import { Request, Response, NextFunction } from "express";
import { createOrderPickupOrderService } from '../services/pickupOrder/createPickupOrder.service';
import { getPickupOrderService } from '../services/pickupOrder/getPickupOrder.service';
import { getPickupOrdersService } from '../services/pickupOrder/getPickupOrders.service';
import { updatePickupOrderService } from '../services/pickupOrder/updatePickupOrder.service';


export class PickupOrderController {
  async getPickupOrdersController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const query = {
        id: parseInt(res.locals.user.id as string),
        pickupStatus: (req.query.pickupStatus as string) || 'all',
        isOrderCreated: parseInt(req.query.isOrderCreated as string),
        isClaimedbyDriver: parseInt(req.query.isClaimedbyDriver as string),
        latitude: parseFloat(req.query.latitude as string) || 0,
        longitude: parseFloat(req.query.longitude as string) || 0,
        take: parseInt(req.query.take as string) || 1000000,
        page: parseInt(req.query.page as string) || 1,
        sortBy: parseInt(req.query.sortBy as string) || 'id',
        sortOrder: req.query.sortOrder as string || 'asc',
      };
     
      const result = await getPickupOrdersService(query);
      res.status(200).send(result);
      return 
    } catch (error) {
      next(error);
    }
  }

  async getPickupOrderController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = req.params.id;
      const result = await getPickupOrderService(Number(id));
      res.status(200).send(result);
      return 
    } catch (error) {
      next(error);
    }
  }

  async updatePickupOrderController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await updatePickupOrderService(req.body);
      res.status(200).send(result);
      return
    } catch (error) {
      next(error);
    }
  }

  async createPickupOrderController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await createOrderPickupOrderService(req.body);
      res.status(200).send(result);
      return
    } catch (error) {
      next(error);
    }
  }
}