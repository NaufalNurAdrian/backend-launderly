import { Router } from "express";
import { DeliveryController } from "../controllers/delivery/delivery.controller";


export class DeliveryRouter {
    private deliveryController : DeliveryController
    private router: Router;

    constructor() {
        this.deliveryController = new DeliveryController();
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get("/", this.deliveryController.getDeliveryRequest);
        this.router.get("/history", this.deliveryController.getPickupHistory);
    }

    getRouter() {
        return this.router;
    }
}