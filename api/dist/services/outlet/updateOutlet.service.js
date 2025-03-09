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
exports.updateOutletService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const updateOutletService = (body) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, outletName, outletType, address } = body;
        const existingOutlet = yield prisma_1.default.outlet.findUnique({
            where: { id: parseInt(id) },
            include: { address: true },
        });
        if (!existingOutlet) {
            throw new Error("Outlet not found");
        }
        const existingAddresses = Array.isArray(existingOutlet.address)
            ? existingOutlet.address
            : existingOutlet.address
                ? [existingOutlet.address]
                : [];
        const requestAddressIds = Array.isArray(address)
            ? address.map((addr) => addr.id).filter(Boolean)
            : [];
        yield prisma_1.default.address.updateMany({
            where: {
                id: {
                    in: existingAddresses.map((addr) => addr.id),
                    notIn: requestAddressIds,
                },
            },
            data: { isDelete: true },
        });
        const updatedAddresses = yield Promise.all(Array.isArray(address)
            ? address.map((addr) => __awaiter(void 0, void 0, void 0, function* () {
                if (addr.id) {
                    return prisma_1.default.address.update({
                        where: { id: addr.id },
                        data: {
                            addressLine: addr.addressLine,
                            city: addr.city,
                            latitude: addr.latitude,
                            longitude: addr.longitude,
                            isDelete: false,
                        },
                    });
                }
                else {
                    return prisma_1.default.address.create({
                        data: {
                            addressLine: addr.addressLine,
                            city: addr.city,
                            latitude: addr.latitude,
                            longitude: addr.longitude,
                            isDelete: false,
                            outletId: parseInt(id),
                        },
                    });
                }
            }))
            : []);
        // Update Outlet
        const updatedOutlet = yield prisma_1.default.outlet.update({
            where: { id: parseInt(id) },
            data: Object.assign(Object.assign({}, (outletName && { outletName })), (outletType && { outletType })),
            include: { address: true },
        });
        return {
            message: "Outlet updated successfully",
            result: updatedOutlet,
        };
    }
    catch (error) {
        throw new Error(error.message);
    }
});
exports.updateOutletService = updateOutletService;
