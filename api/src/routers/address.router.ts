import { AddressController } from "../controllers/address.controller";
import { verifyToken } from "../middlewares/verify";

import { Router } from "express";

export class AddressRouter {
  private router: Router;
  private addressController: AddressController;

  constructor() {
    this.addressController = new AddressController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/user",
      verifyToken,
      this.addressController.getUserAddressController
    );
    this.router.get("/outlet",this.addressController.getOutletAddress);
    this.router.get("/:id", verifyToken, this.addressController.getAddressById);
    this.router.post(
      "/",
      verifyToken,
      this.addressController.createUserAddressController
    );
    this.router.patch(
      "/:id",
      verifyToken,
      this.addressController.updateUserAddressController
    );
    this.router.delete(
      "/:id",
      verifyToken,
      this.addressController.deleteUserAddressController
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
