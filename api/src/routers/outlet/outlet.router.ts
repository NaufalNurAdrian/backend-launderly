import { Router } from "express";
import { OutletController } from "../../controllers/outlet/outlet.controller";


export class OutletRouter {
    private outletController: OutletController;
    private router: Router;

    constructor() {
        this.outletController = new OutletController();
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post("/create", this.outletController.createOutletController);
    }

    getRouter() {
        return this.router;
    }
}