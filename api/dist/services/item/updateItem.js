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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateItemService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const updateItemService = (body) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingItem = yield prisma_1.default.laundryItem.findFirst({
            where: { itemName: body.itemName },
        });
        if (existingItem) {
            throw new Error("Item already exist");
        }
        const updatedItem = yield prisma_1.default.laundryItem.update({
            where: { id: Number(body.id) },
            data: { itemName: body.itemName },
        });
        return updatedItem;
    }
    catch (error) {
        throw new Error(error.message);
    }
});
exports.updateItemService = updateItemService;
