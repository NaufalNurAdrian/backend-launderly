"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemController = void 0;
const getItemService_1 = require("../services/item/getItemService");
const createItem_1 = require("../services/item/createItem");
const updateItem_1 = require("../services/item/updateItem");
const deleteItem_1 = require("../services/item/deleteItem");
class ItemController {
    createItemController(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const item = yield (0, createItem_1.createItemService)(req.body);
                res
                    .status(200)
                    .send({ message: "Successfuly create item laundry", item });
            }
            catch (error) {
                next(error);
                res.status(500).send({ message: "cannot create item", error });
            }
        });
    }
    getItemController(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const getitem = yield (0, getItemService_1.getItemService)();
                res.status(200).send({ message: "Successfuly get item", getitem });
            }
            catch (error) {
                res.status(500).send({ message: "internal server error", error });
            }
        });
    }
    updateItemController(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, itemName } = req.body;
                if (!id || !itemName) {
                    res.status(400).send({ message: "Invalid item ID or item name" });
                }
                const updateItem = yield (0, updateItem_1.updateItemService)(req.body);
                res.status(200).send({ message: "update item laundry", updateItem });
            }
            catch (error) {
                res
                    .status(500)
                    .send({ message: "cannot update item", error: error.message });
            }
        });
    }
    deleteItemController(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.body;
                if (!id) {
                    res.status(400).send({ message: "Invalid item ID" });
                }
                const deleteItem = yield (0, deleteItem_1.deleteItemService)(id);
                res.status(200).send({ message: "delete item laundry", deleteItem });
            }
            catch (error) {
                res
                    .status(500)
                    .send({ message: "cannot delete item", error: error.message });
            }
        });
    }
}
exports.ItemController = ItemController;
