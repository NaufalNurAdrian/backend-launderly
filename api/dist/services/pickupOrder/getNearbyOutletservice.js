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
exports.getNearbyOutletsService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
// Fungsi untuk menghitung jarak antara dua koordinat dengan Haversine formula
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius bumi dalam km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Jarak dalam km
}
// Service untuk mendapatkan outlet terdekat
const getNearbyOutletsService = (latitude, longitude) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!latitude || !longitude) {
            throw new Error("Latitude and longitude are required");
        }
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
        // Filter outlet yang berada dalam radius 5km
        const nearbyOutlets = outlets.filter((outlet) => {
            const primaryAddress = outlet.address[0]; // Ambil alamat pertama dari array
            if (!primaryAddress ||
                primaryAddress.latitude === null ||
                primaryAddress.longitude === null) {
                console.log(`Skipping outlet ${outlet.id}, invalid coordinates.`);
                return false; // Jika tidak ada alamat atau koordinatnya null, skip outlet ini
            }
            const distance = getDistanceFromLatLonInKm(latitude, longitude, primaryAddress.latitude, primaryAddress.longitude);
            console.log(`Outlet ${outlet.id} is ${distance} km away from user`);
            return distance <= 5; // Hanya return outlet yang dalam radius 5km
        });
        console.log("Nearby outlets:", nearbyOutlets);
        return nearbyOutlets; // Return data ke controller
    }
    catch (error) {
        console.error("Error retrieving nearby outlets:", error);
        throw new Error("Failed to retrieve nearby outlets");
    }
});
exports.getNearbyOutletsService = getNearbyOutletsService;
