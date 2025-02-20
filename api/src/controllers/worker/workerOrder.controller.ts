import { Request, Response } from "express";
<<<<<<< HEAD
import { getWorkerOrdersService } from "../../services/worker/order/getOrders.service";
=======
import { getWorkerOrdersService } from "../../services/worker/order/getOrderas.service";
>>>>>>> 743f04f28e6a55c6a915d4401f0ce2d5cbb5999f
import { createOrderWorker } from "../../services/worker/order/createOrderWorker.service";
import { updateOrderStatus } from "../../services/worker/order/finishOrder.service";
import { getWorkerOrdersHistoryService } from "../../services/worker/order/getOrderHistory.service";
import { getOrderItem } from "../../services/worker/order/getOrderItem";

export class OrderWorkerController {
  async getOrders(req: Request, res: Response) {
    try {
<<<<<<< HEAD
      const workerId = req.user?.id!;
      const { order, sortBy, page, pageSize } = req.query;

=======
      const workerId = req.user?.id!
      const { order, sortBy, page, pageSize } = req.query;
      
>>>>>>> 743f04f28e6a55c6a915d4401f0ce2d5cbb5999f
      const result = await getWorkerOrdersService({
        workerId: workerId,
        sortBy: sortBy as "createdAt" | "weight",
        order: order as "asc" | "desc",
        page: page ? parseInt(page as string) : 1,
        pageSize: pageSize ? parseInt(pageSize as string) : 4,
      });

      res.status(200).send({
        station: result.station,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error: any) {
      res.status(400).send({ message: error.message });
    }
  }
  async getOrderHistory(req: Request, res: Response) {
    try {
<<<<<<< HEAD
      const workerId = req.user?.id!;
      const { order, sortBy, page, pageSize } = req.query;
=======
      const workerId = req.user?.id!
      const {  order, sortBy, page, pageSize } = req.query;
>>>>>>> 743f04f28e6a55c6a915d4401f0ce2d5cbb5999f

      const result = await getWorkerOrdersHistoryService({
        workerId: workerId,
        sortBy: sortBy as "createdAt",
        order: order as "asc" | "desc",
        page: page ? parseInt(page as string) : 1,
<<<<<<< HEAD
        pageSize: pageSize ? parseInt(pageSize as string) : 1,
=======
        pageSize: pageSize ? parseInt(pageSize as string) : 4,
>>>>>>> 743f04f28e6a55c6a915d4401f0ce2d5cbb5999f
      });

      res.status(200).send({
        station: result.station,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error: any) {
      res.status(400).send({ message: error.message });
    }
  }
  async createOrderWorker(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
<<<<<<< HEAD
      const workerId = req.user?.id!;
=======
      const  workerId  = req.user?.id!;
>>>>>>> 743f04f28e6a55c6a915d4401f0ce2d5cbb5999f

      const result = await createOrderWorker({
        workerId: workerId,
        orderId: parseInt(orderId as string),
      });

      res.status(200).send({ message: "order created", data: result });
    } catch (error: any) {
      res.status(400).send({ message: error.message });
    }
  }
  async finishOrderWorker(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
<<<<<<< HEAD
      const workerId = req.user?.id!;
=======
      const workerId  = req.user?.id!;
>>>>>>> 743f04f28e6a55c6a915d4401f0ce2d5cbb5999f

      const result = await updateOrderStatus({
        workerId: workerId,
        orderId: parseInt(orderId as string),
      });

      res.status(200).send({ message: "order completed", data: result });
    } catch (error: any) {
      res.status(400).send({ message: error.message });
    }
  }

  async getOrderItem(req: Request, res: Response) {
    try {
      const { orderId } = req.params;

      const result = await getOrderItem(parseInt(orderId as string));

      res.status(200).send({ message: "order item", data: result });
    } catch (error: any) {
      res.status(400).send({ message: error.message });
    }
  }
}
