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
exports.createItemService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const createItemService = (body) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { itemName } = body;
        const existingItem = yield prisma_1.default.laundryItem.findFirst({
            where: { itemName, isDelete: false },
        });
        if (existingItem) {
            throw new Error('Item already exist');
        }
        const deletedItem = yield prisma_1.default.laundryItem.findFirst({
            where: { itemName, isDelete: true },
        });
        if (deletedItem) {
            yield prisma_1.default.laundryItem.update({
                where: { id: deletedItem.id },
                data: { isDelete: false },
            });
        }
        else {
            const newItem = yield prisma_1.default.laundryItem.create({
                data: Object.assign({}, body),
            });
        }
    }
    catch (error) {
        throw error;
    }
});
exports.createItemService = createItemService;
