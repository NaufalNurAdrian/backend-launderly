import { getItemService } from "../services/item/getItemService";
import { createItemService } from "../services/item/createItem";
import { NextFunction, Request, Response } from "express";
import { updateItemService } from "../services/item/updateItem";
import { deleteItemService } from "../services/item/deleteItem";

export class ItemController {
  async createItemController(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await createItemService(req.body);
      res
        .status(200)
        .send({ message: "Successfuly create item laundry", item });
    } catch (error: any) {
      next(error);
      res.status(500).send({ message: "cannot create item", error });
    }
  }

  async getItemController(req: Request, res: Response) {
    try {
      const getitem = await getItemService();
      res.status(200).send({ message: "Successfuly get item", getitem });
    } catch (error: any) {
      res.status(500).send({ message: "internal server error", error });
    }
  }

  async updateItemController(req: Request, res: Response) {
    try {
      const { id, itemName } = req.body;
      if (!id || !itemName) {
        res.status(400).send({ message: "Invalid item ID or item name" });
      }
      const updateItem = await updateItemService(req.body);
      res.status(200).send({ message: "update item laundry", updateItem });
    } catch (error: any) {
      res
        .status(500)
        .send({ message: "cannot update item", error: error.message });
    }
  }
  async deleteItemController(req: Request, res: Response) {
    try {
      const { id } = req.body;
      if (!id) {
        res.status(400).send({ message: "Invalid item ID" });
      }
      const deleteItem = await deleteItemService(id);
      res.status(200).send({ message: "delete item laundry", deleteItem });
    } catch (error: any) {
      res
        .status(500)
        .send({ message: "cannot delete item", error: error.message });
    }
  }
}
