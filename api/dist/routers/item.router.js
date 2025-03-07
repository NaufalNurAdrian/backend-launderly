"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemRouter = void 0;
const item_controller_1 = require("../controllers/item.controller");
const verify_1 = require("../middlewares/verify");
const express_1 = require("express");
class ItemRouter {
    constructor() {
        this.itemController = new item_controller_1.ItemController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/create", verify_1.verifyToken, verify_1.checkSuperAdmin, this.itemController.createItemController);
        this.router.get("/", verify_1.verifyToken, verify_1.checkSuperAdmin, this.itemController.getItemController);
        this.router.patch("/update", verify_1.verifyToken, verify_1.checkSuperAdmin, this.itemController.updateItemController);
        this.router.patch("/delete", verify_1.verifyToken, verify_1.checkSuperAdmin, this.itemController.deleteItemController);
    }
    getRouter() {
        return this.router;
    }
}
exports.ItemRouter = ItemRouter;
