"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutletRouter = void 0;
const express_1 = require("express");
const outlet_controller_1 = require("../controllers/outlet.controller");
const verify_1 = require("../middlewares/verify");
class OutletRouter {
    constructor() {
        this.outletController = new outlet_controller_1.OutletController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/create", verify_1.verifyToken, verify_1.checkSuperAdmin, this.outletController.createOutletController);
        this.router.get("/", verify_1.verifyToken, verify_1.checkSuperAdmin, this.outletController.getAllOutlet);
        this.router.patch("/update/", verify_1.verifyToken, verify_1.checkSuperAdmin, this.outletController.updateOutlet);
        this.router.patch("/delete", verify_1.verifyToken, verify_1.checkSuperAdmin, this.outletController.deleteOutlet);
        this.router.get("/:id", verify_1.verifyToken, verify_1.checkSuperAdmin, this.outletController.getOutletById);
    }
    getRouter() {
        return this.router;
    }
}
exports.OutletRouter = OutletRouter;
