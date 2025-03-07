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
exports.generateOrderNumber = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const generateOrderNumber = (type) => __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0].replace(/-/g, "");
    const count = yield prisma_1.default.deliveryOrder.count({
        where: {
            createdAt: {
                gte: new Date(`${today.toISOString().split("T")[0]}T00:00:00.000Z`),
                lt: new Date(`${today.toISOString().split("T")[0]}T23:59:59.999Z`),
            },
        },
    });
    const sequence = String(count + 1).padStart(3, "0");
    return `${type}-${formattedDate}-${sequence}`;
});
exports.generateOrderNumber = generateOrderNumber;
