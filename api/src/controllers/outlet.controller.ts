import { Request, Response } from "express";
import { createOutletService } from "../services/outlet/createOutlet.service";

export class OutletController {
    async createOutletController(req: Request, res: Response) {
        try {
            const  result = await createOutletService(req.body);
            res.status(201).send({ message: "Outlet created successfully", result });
        } catch (error: any) {
            res.status(400).send({ message: error.message});
        }
    } 
}