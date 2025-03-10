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
exports.getAllOutletService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const getAllOutletService = (page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const skip = (page - 1) * limit; // Hitung offset
        const outlets = yield prisma_1.default.outlet.findMany({
            skip,
            take: limit,
            select: {
                id: true,
                outletName: true,
                outletType: true,
                address: true,
                isDelete: true
            },
        });
        const totalCount = yield prisma_1.default.outlet.count(); // Hitung total data
        return { outlets, totalCount };
    }
    catch (error) {
        throw new Error(error.message);
    }
});
exports.getAllOutletService = getAllOutletService;
