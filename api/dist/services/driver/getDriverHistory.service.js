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
exports.getDriverHistoryService = void 0;
const haversine_1 = __importDefault(require("../../helpers/haversine"));
const prisma_1 = __importDefault(require("../../prisma"));
const getDriverHistoryService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { driverId, type, sortBy, order, page = 1, pageSize = 5 } = query;
        const driver = yield prisma_1.default.employee.findUnique({
            where: { userId: driverId },
            select: { outletId: true, id: true },
        });
        if (!driver || !driver.outletId) {
            throw new Error("Driver tidak terdaftar di outlet manapun");
        }
        const outlet = yield prisma_1.default.outlet.findUnique({
            where: { id: driver.outletId },
            include: {
                address: true,
            },
        });
        if (!outlet || !outlet.address || outlet.address.length === 0) {
            throw new Error("Outlet tidak memiliki alamat utama");
        }
        const outletAddress = outlet.address[0];
        const outletLat = outletAddress.latitude || 0;
        const outletLon = outletAddress.longitude || 0;
        const pickupHistory = !type || type === "pickup"
            ? yield prisma_1.default.pickupOrder.findMany({
                where: {
                    outletId: driver.outletId,
                    pickupStatus: "RECEIVED_BY_OUTLET",
                    driverId: driver.id,
                },
                include: {
                    address: true,
                    user: true,
                },
            })
            : [];
        const deliveryHistory = !type || type === "delivery"
            ? yield prisma_1.default.deliveryOrder.findMany({
                where: {
                    deliveryStatus: "RECEIVED_BY_CUSTOMER",
                    driverId: driver.id,
                },
                include: {
                    address: true,
                    user: true,
                    order: true,
                },
            })
            : [];
        const allHistory = [
            ...pickupHistory.map((request) => (Object.assign(Object.assign({}, request), { type: "pickup" }))),
            ...deliveryHistory.map((request) => (Object.assign(Object.assign({}, request), { type: "delivery" }))),
        ];
        const historyWithDistance = allHistory.map((request) => {
            if (!request.address) {
                throw new Error("Request tidak memiliki alamat");
            }
            const requestLat = request.address.latitude || 0;
            const requestLon = request.address.longitude || 0;
            const distance = (0, haversine_1.default)(outletLat, outletLon, requestLat, requestLon);
            return Object.assign(Object.assign({}, request), { distance });
        });
        if (sortBy === "distance") {
            historyWithDistance.sort((a, b) => {
                return order === "asc" ? a.distance - b.distance : b.distance - a.distance;
            });
        }
        else if (sortBy === "createdAt") {
            historyWithDistance.sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return order === "asc" ? dateA - dateB : dateB - dateA;
            });
        }
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedHistory = historyWithDistance.slice(startIndex, endIndex);
        return {
            data: paginatedHistory,
            pagination: {
                total: historyWithDistance.length,
                page: page,
                pageSize: pageSize,
                totalPages: Math.ceil(historyWithDistance.length / pageSize),
            },
        };
    }
    catch (err) {
        throw err;
    }
});
exports.getDriverHistoryService = getDriverHistoryService;
