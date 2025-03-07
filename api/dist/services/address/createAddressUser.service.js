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
exports.createUserAddressService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const createUserAddressService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const { addressLine, city, isPrimary, latitude, longitude } = req.body;
        if (!addressLine || !city) {
            return res.status(400).json({ message: "Address line and city are required" });
        }
        if (isPrimary) {
            yield prisma_1.default.address.updateMany({
                where: { userId, isPrimary: true },
                data: { isPrimary: false },
            });
        }
        // Buat alamat baru
        const newAddress = yield prisma_1.default.address.create({
            data: {
                addressLine,
                city,
                isPrimary: isPrimary || false,
                latitude,
                longitude,
                userId,
            },
        });
        return res.status(201).json({ message: "Address created successfully", address: newAddress });
    }
    catch (error) {
        console.error("Error creating address:", error);
        return res.status(500).json({ message: "Internal server error", error });
    }
});
exports.createUserAddressService = createUserAddressService;
