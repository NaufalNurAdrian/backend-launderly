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
exports.getPickupOrdersService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const getPickupOrdersService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, sortBy = "createdAt", sortOrder = "desc", pickupStatus, isOrderCreated, take = 10, id, isClaimedbyDriver, } = query;
        const existingUser = yield prisma_1.default.user.findFirst({
            where: { id: id },
            select: { role: true },
        });
        if (!existingUser) {
            throw new Error("User not found!");
        }
        if (existingUser.role !== "CUSTOMER") {
            throw new Error("Unauthorized access!");
        }
        const whereClause = { userId: id };
        if (pickupStatus !== "all") {
            whereClause.pickupStatus = pickupStatus;
        }
        if (!Number.isNaN(isOrderCreated)) {
            whereClause.isOrderCreated = Boolean(isOrderCreated);
        }
        if (Boolean(isClaimedbyDriver)) {
            whereClause.driverId = { not: null };
        }
        const pickupOrders = yield prisma_1.default.pickupOrder.findMany({
            where: whereClause,
            include: {
                address: true,
                user: true,
                outlet: true,
            },
            orderBy: {
                [sortBy]: sortOrder,
            },
            skip: (page - 1) * take,
            take,
        });
        const count = yield prisma_1.default.pickupOrder.count({ where: whereClause });
        return {
            data: pickupOrders,
            meta: { page, take, total: count },
        };
    }
    catch (error) {
        throw error;
    }
});
exports.getPickupOrdersService = getPickupOrdersService;
