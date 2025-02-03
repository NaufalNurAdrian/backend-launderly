import { Request, Response } from "express";
import { getWorkerOrdersService } from "../../services/worker/order/getOrderas.service";

export class OrderWorkerController {
    async getOrderController(req: Request, res: Response) {
        try {
            const { workerId, order, sortBy, page, pageSize, station } = req.query;

            if (!workerId || !station) {
                throw new Error("workerId dan station harus disediakan");
            }

            const result = await getWorkerOrdersService({
                workerId: parseInt(workerId as string),
                sortBy: sortBy as "createdAt",
                order: order as "asc" | "desc",
                page: page ? parseInt(page as string) : 1,
                pageSize: pageSize ? parseInt(pageSize as string) : 4,
                station: station as "WASHING" | "IRONING" | "PACKING", 
            });

            res.status(200).send({
                data: result.data,
                pagination: result.pagination,
            });
        } catch (error: any) {
            res.status(400).send({ message: error.message });
        }
    }
}