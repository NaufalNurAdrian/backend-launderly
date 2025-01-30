import { Router } from "express";
import { PickupController } from "../controllers/pick up/pickup.controller";


export class PickupRouter {
    private pickupController : PickupController
    private router: Router;

    constructor() {
        this.pickupController = new PickupController();
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get("/", this.pickupController.getPickupRequest);
        this.router.get("/history", this.pickupController.getPickupHistory);
        this.router.patch("/update", this.pickupController.updatePickupStatus);
    }

    getRouter() {
        return this.router;
    }
}