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
exports.getOutletByIdService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const getOutletByIdService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const numericId = Number(id);
        if (isNaN(numericId)) {
            throw new Error("Invalid outlet ID");
        }
        const result = yield prisma_1.default.outlet.findUnique({
            where: { id: numericId },
            select: {
                id: true,
                outletName: true,
                outletType: true,
                address: {
                    where: { isDelete: false },
                    select: { id: true, addressLine: true, city: true },
                },
            },
        });
        if (!result) {
            throw new Error("Outlet not found");
        }
        return result;
    }
    catch (error) {
        throw new Error(error.message);
    }
});
exports.getOutletByIdService = getOutletByIdService;
