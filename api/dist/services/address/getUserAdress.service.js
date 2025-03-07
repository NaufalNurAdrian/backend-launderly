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
exports.getUserAddressesService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const getUserAddressesService = (req) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            throw new Error("Unauthorized");
        }
        const addresses = yield prisma_1.default.address.findMany({
            where: { userId, isDelete: false },
            orderBy: { isPrimary: "desc" },
        });
        return { message: "Addresses retrieved successfully", addresses };
    }
    catch (error) {
        console.error("Error retrieving addresses:", error);
        throw new Error("Failed to retrieve addresses");
    }
});
exports.getUserAddressesService = getUserAddressesService;
