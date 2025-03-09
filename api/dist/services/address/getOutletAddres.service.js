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
exports.getAllOutletsService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
// Service untuk mendapatkan outlet
const getAllOutletsService = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Ambil semua outlet yang belum dihapus dari database
        const outlets = yield prisma_1.default.outlet.findMany({
            where: { isDelete: false },
            include: {
                address: {
                    where: { isDelete: false },
                    select: { latitude: true, longitude: true },
                },
            },
        });
        return outlets;
    }
    catch (error) {
        console.error("Error retrieving outlets:", error);
        throw new Error("Failed to retrieve outlets");
    }
});
exports.getAllOutletsService = getAllOutletsService;
