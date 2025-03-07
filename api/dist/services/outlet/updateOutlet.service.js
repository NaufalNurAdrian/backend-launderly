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
<<<<<<< HEAD
            include: { address: true }, // Ambil alamat yang sudah ada
=======
            include: { address: true },
>>>>>>> 67e351f8aa1f613af1c69e9ed81c6311eaa563db
        });
        if (!existingOutlet) {
            throw new Error("Outlet not found");
        }
<<<<<<< HEAD
        // Cek alamat yang ada di database
=======
>>>>>>> 67e351f8aa1f613af1c69e9ed81c6311eaa563db
        const existingAddresses = Array.isArray(existingOutlet.address)
            ? existingOutlet.address
            : existingOutlet.address
                ? [existingOutlet.address]
                : [];
<<<<<<< HEAD
        // Mapping ID alamat yang dikirim di request
        const requestAddressIds = Array.isArray(address)
            ? address.map((addr) => addr.id).filter(Boolean)
            : [];
        // Set alamat lama yang tidak ada di request menjadi isDelete: true
=======
        const requestAddressIds = Array.isArray(address)
            ? address.map((addr) => addr.id).filter(Boolean)
            : [];
>>>>>>> 67e351f8aa1f613af1c69e9ed81c6311eaa563db
        yield prisma_1.default.address.updateMany({
            where: {
                id: {
                    in: existingAddresses.map((addr) => addr.id),
<<<<<<< HEAD
                    notIn: requestAddressIds, // Alamat yang tidak ada di request
=======
                    notIn: requestAddressIds,
>>>>>>> 67e351f8aa1f613af1c69e9ed81c6311eaa563db
                },
            },
            data: { isDelete: true },
        });
<<<<<<< HEAD
        // Proses alamat baru dan update alamat lama
=======
>>>>>>> 67e351f8aa1f613af1c69e9ed81c6311eaa563db
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
<<<<<<< HEAD
            : [] // Jika address bukan array, kosongkan prosesnya
        );
        // Update Outlet
        const updatedOutlet = yield prisma_1.default.outlet.update({
            where: { id: parseInt(id) },
            data: Object.assign(Object.assign({}, (outletName && { outletName })), (outletType && { outletType })),
            include: { address: true }, // Ambil alamat yang sudah diperbarui
=======
            : []);
        const updatedOutlet = yield prisma_1.default.outlet.update({
            where: { id: parseInt(id) },
            data: Object.assign(Object.assign({}, (outletName && { outletName })), (outletType && { outletType })),
            include: { address: true },
>>>>>>> 67e351f8aa1f613af1c69e9ed81c6311eaa563db
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
