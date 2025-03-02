import { Request, Response } from "express";
import { createOutletService } from "../services/outlet/createOutlet.service";
import { getAllOutletService } from "../services/outlet/getAllOutlet.service";
import { getOutletByIdService } from "../services/outlet/getOutletById.service";
import { updateOutletService } from "../services/outlet/updateOutlet.service";
import { deleteOutletService } from "../services/outlet/deleteOutlet.service";

export class OutletController {
  async createOutletController(req: Request, res: Response) {
    try {
      const result = await createOutletService(req.body);
      res.status(201).send({ message: "Outlet created successfully", result });
    } catch (error: any) {
      res.status(500).send({ message: error.message });
    }
  }

  async getAllOutlet(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { outlets, totalCount } = await getAllOutletService(page, limit);

      res.status(200).send({
        message: "Successfully fetched outlets",
        outlets: outlets ?? [],
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
      });
    } catch (error: any) {
      res.status(500).send({ message: "Failed to get outlets" });
    }
  }

  async getOutletById(req: Request, res: Response) {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).send({ message: "Outlet ID is required" });
      }

      const outlet = await getOutletByIdService(id);
      if (!outlet) {
        res.status(404).send({ message: "Outlet not found" });
      }

      res
        .status(200)
        .send({ message: "Outlet retrieved successfully", outlet });
    } catch (error: any) {
      res
        .status(500)
        .send({ message: error.message || "Cannot retrieve outlet" });
    }
  }

  async updateOutlet(req: Request, res: Response) {
    try {
      const id = req.body.id;
      if (!id) {
        res.status(400).send({ message: "Outlet ID is required" });
      }
      const result = await updateOutletService(req.body);

      res.status(200).send({ message: "Outlet updated successfully", result });
    } catch (error: any) {
      res
        .status(500)
        .send({ message: error.message || "Cannot update outlet" });
    }
  }

  async deleteOutlet(req: Request, res: Response) {
    try {
      const id = req.body;
      if (!id) {
        res.status(400).send({ message: "Outlet ID is required" });
      }

      const result = await deleteOutletService(id);
      res.status(200).send({ message: "Outlet deleted successfully", result });
    } catch (error: any) {
      res
        .status(500)
        .send({ message: error.message || "Cannot delete outlet" });
    }
  }
}
