import { getItemService } from "../services/item/getItemService";
import { createItemService } from "../services/item/createItem";
import { NextFunction, Request, Response } from "express";

export class ItemController {
    async createItemController(req: Request, res: Response, next: NextFunction) {
        try {
            const item = await createItemService(req.body);
            res.status(200).send({message: "Successfuly create item laundry", item})
        } catch (error: any) {
            next(error)
            res.status(500).send({message: "cannot create item", error})
        }
    }

    async getItemController(req: Request, res: Response) {
        try {
            const getitem = await getItemService()
            res.status(200).send({message: "Successfuly get item", getitem})
        } catch (error: any) {
            res.status(500).send({message: "internal server error", error})
        }
    }
}