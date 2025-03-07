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
exports.updateUserAddressService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const updateUserAddressService = (id, body) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { addressLine, city, isPrimary, latitude, longitude } = body;
        const address = yield prisma_1.default.address.findFirst({
            where: { id: id },
        });
        if (!address || address.isDelete === true) {
            throw new Error("Address not found!");
        }
        if (addressLine) {
            const existingAddress = yield prisma_1.default.address.findFirst({
                where: { addressLine: { equals: addressLine }, id: { not: id } },
            });
            if (existingAddress) {
                throw new Error("Address already exists!");
            }
        }
        const update = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            if (isPrimary === true) {
                yield tx.address.updateMany({
                    where: { userId: address.userId }, // Pastikan hanya milik user yang sama
                    data: { isPrimary: false },
                });
            }
            const updateAddress = yield tx.address.update({
                where: { id: address.id },
                data: {
                    addressLine,
                    city,
                    isPrimary,
                    latitude: latitude !== undefined ? parseFloat(latitude) : undefined,
                    longitude: longitude !== undefined ? parseFloat(longitude) : undefined,
                },
            });
            return updateAddress;
        }));
        return { message: "Update address success", data: update };
    }
    catch (error) {
        throw error;
    }
});
exports.updateUserAddressService = updateUserAddressService;
