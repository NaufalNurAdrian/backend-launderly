import { Request, Response } from "express";
import { createOutletService } from "../services/outlet/createOutlet.service";
import { getAllOutletService } from "../services/outlet/getAllOutlet.service";

export class OutletController {
    async createOutletController(req: Request, res: Response) {
        try {
            const  result = await createOutletService(req.body);
            res.status(201).send({ message: "Outlet created successfully", result });
        } catch (error: any) {
            res.status(500).send({ message: error.message});
        }
    } 

    async getAllOutlet(req: Request, res: Response) {
        try {
            const outlet = getAllOutletService();
            res.status(200).send({message: "successfuly get all outlet", outlet})
        } catch (error: any) {
            res.status(500)
        }
    }
}