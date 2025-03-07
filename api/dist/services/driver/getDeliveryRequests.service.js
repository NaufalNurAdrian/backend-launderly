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
exports.getDeliveryRequestsService = void 0;
const haversine_1 = __importDefault(require("../../helpers/haversine"));
const prisma_1 = __importDefault(require("../../prisma"));
const getDeliveryRequestsService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { driverId, sortBy, order = "asc", page = 1, pageSize = 3 } = query;
        const driver = yield prisma_1.default.employee.findUnique({
            where: { userId: driverId },
            select: { outletId: true, id: true },
        });
        if (!driver || !driver.outletId) {
            throw new Error("Outlet not found");
        }
        const pickup = yield prisma_1.default.order.findMany({
            where: { pickupOrderId: driver.outletId },
        });
        const outletId = driver.outletId;
        const whereClause = {
            AND: [
                {
                    OR: [
                        { deliveryStatus: "WAITING_FOR_DRIVER", driverId: null },
                        { deliveryStatus: "ON_THE_WAY_TO_OUTLET", driverId: driver.id },
                        { deliveryStatus: "ON_THE_WAY_TO_CUSTOMER", driverId: driver.id },
                    ],
                },
                {
                    NOT: { deliveryStatus: "RECEIVED_BY_CUSTOMER" },
                },
                {
                    order: {
                        pickupOrder: {
                            outletId: outletId,
                        },
                    },
                },
            ],
        };
        const outlet = yield prisma_1.default.outlet.findUnique({
            where: { id: driver.outletId },
            include: {
                address: true,
            },
        });
        if (!outlet || !outlet.address || outlet.address.length === 0) {
            throw new Error("Primary address not found");
        }
        const outletAddress = outlet.address[0];
        const outletLat = outletAddress.latitude || 0;
        const outletLon = outletAddress.longitude || 0;
        const deliveryRequests = yield prisma_1.default.deliveryOrder.findMany({
            where: whereClause,
            include: {
                address: true,
                user: true,
            },
        });
        const deliveryRequestsWithDistance = deliveryRequests.map((request) => {
            if (!request.address) {
                throw new Error("Delivery request doesn't have an address");
            }
            const deliveryLat = request.address.latitude || 0;
            const deliveryLon = request.address.longitude || 0;
            const distance = (0, haversine_1.default)(outletLat, outletLon, deliveryLat, deliveryLon);
            return Object.assign(Object.assign({}, request), { distance, deliveryPrice: 5000 });
        });
        if (sortBy === "distance") {
            deliveryRequestsWithDistance.sort((a, b) => {
                return order === "asc" ? a.distance - b.distance : b.distance - a.distance;
            });
        }
        else if (sortBy === "createdAt") {
            deliveryRequestsWithDistance.sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return order === "asc" ? dateA - dateB : dateB - dateA;
            });
        }
        else {
            deliveryRequestsWithDistance.sort((a, b) => {
                const dateA = new Date(a.updatedAt).getTime();
                const dateB = new Date(b.updatedAt).getTime();
                return order === "asc" ? dateA - dateB : dateB - dateA;
            });
        }
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedRequests = deliveryRequestsWithDistance.slice(startIndex, endIndex);
        return {
            data: paginatedRequests,
            pagination: {
                total: deliveryRequestsWithDistance.length,
                page: page,
                pageSize: pageSize,
                totalPages: Math.ceil(deliveryRequestsWithDistance.length / pageSize),
            },
        };
    }
    catch (err) {
        throw err;
    }
});
exports.getDeliveryRequestsService = getDeliveryRequestsService;
