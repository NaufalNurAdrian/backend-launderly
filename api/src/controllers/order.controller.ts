import { bypassOrderService } from "../services/order/bypass.service";
import { getOrdersService } from "../services/order/getOrders";
import { UpdateOrderService } from "../services/order/updateOrder.service";
import { Request, Response } from "express";

export class OrderController {
    async createOrderController(req: Request, res: Response) {
        try {
            const order = await UpdateOrderService(req.body)
            res.status(200).send({message: "successfuly create order", order})
        } catch (error) {
            res.status(500).send({message: "Cannot create order"})
        }
    }
    async getOrdersController(req: Request, res: Response) {
        try {
            if (!req.user?.id) {
              return  res.status(401).send({ message: "Unauthorized: User ID not found" });
            }
    
            const query = {
                id: req.user?.id,
                take: req.query.take ? parseInt(req.query.take as string) : 1000000,
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                sortBy: req.query.sortBy ? (req.query.sortBy as string) : "id",
                sortOrder: req.query.sortOrder ? (req.query.sortOrder as string) : "asc",
                filterOutlet: req.query.filterOutlet && req.query.filterOutlet !== "all"
                    ? parseInt(req.query.filterOutlet as string)
                    : "all",
                filterStatus: req.query.filterStatus ? (req.query.filterStatus as string) : "all",
                filterDate: req.query.filterDate ? new Date(req.query.filterDate as string) : undefined,
                search: req.query.search ? (req.query.search as string) : "",
                filterCategory: req.query.filterCategory ? (req.query.filterCategory as string) : "",
            };
    
    
            const getOrder = await getOrdersService(query);
    
    
            res.status(200).send({ message: "Successfully fetched orders", getOrder });
        } catch (error: any) {
            res.status(500).send({ message: "Cannot get orders", error: error.message });
        }
    }
    async bypassOrderController(req: Request, res: Response) {
        try {
            const bypassOrder = await bypassOrderService(req.body)
            res.status(200).send({message: "Successuly bypass order", bypassOrder})
        } catch (error: any) {
            res.status(500).send({message: "Cannot Bypass Order", error})
        }
    }
}