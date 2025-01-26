import { Request, Response } from "express";
import { createOutlet } from "../services/outlet/createOutlet.service";

export class OutletController {
    async createOutletController(req: Request, res: Response) {
        try {
            const  result = await createOutlet(req.body.outletName, req.body.outletType, req.body.address);
            res.status(201).send(result);
        } catch (error) {
            res.status(400).send({ error, message: "Failed to create outlet" });
        }
    } 
}