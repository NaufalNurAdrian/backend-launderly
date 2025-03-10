"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressRouter = void 0;
const address_controller_1 = require("../controllers/address.controller");
const verify_1 = require("../middlewares/verify");
const express_1 = require("express");
class AddressRouter {
    constructor() {
        this.addressController = new address_controller_1.AddressController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/user", verify_1.verifyToken, this.addressController.getUserAddressController);
        this.router.get("/outlet", this.addressController.getOutletAddress);
        this.router.get("/:id", verify_1.verifyToken, this.addressController.getAddressById);
        this.router.post("/", verify_1.verifyToken, this.addressController.createUserAddressController);
        this.router.patch("/:id", verify_1.verifyToken, this.addressController.updateUserAddressController);
        this.router.delete("/:id", verify_1.verifyToken, this.addressController.deleteUserAddressController);
    }
    getRouter() {
        return this.router;
    }
}
exports.AddressRouter = AddressRouter;
