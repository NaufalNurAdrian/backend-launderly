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
exports.getWorkerOrdersHistoryService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../../prisma"));
const getWorkerOrdersHistoryService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { workerId, order, page = 1, pageSize = 4 } = query;
        const worker = yield prisma_1.default.user.findUnique({
            where: { id: workerId, role: "WORKER" },
        });
        if (!worker) {
            throw new Error("Hanya worker yang dapat mengakses data ini");
        }
        const workerStation = yield prisma_1.default.employee.findFirst({
            where: {
                userId: workerId,
            },
        });
        if (!workerStation) {
            throw new Error("Worker tidak memiliki station yang ditetapkan");
        }
        const station = workerStation.station;
        const whereClause = {
            AND: [
                {
                    OR: [{ orderStatus: client_1.OrderStatus.WASHING_COMPLETED }, { orderStatus: client_1.OrderStatus.IRONING_COMPLETED }, { orderStatus: client_1.OrderStatus.AWAITING_PAYMENT }],
                },
                {
                    orderWorker: {
                        some: {
                            workerId: workerStation.id,
                        },
                    },
                },
            ],
        };
        const orders = yield prisma_1.default.order.findMany({
            where: whereClause,
            include: {
                orderItem: true,
                orderWorker: true,
            },
            orderBy: {
                createdAt: order || "asc",
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
        const totalOrders = yield prisma_1.default.order.count({
            where: whereClause,
        });
        return {
            station: station,
            data: orders,
            pagination: {
                total: totalOrders,
                page: page,
                pageSize: pageSize,
                totalPages: Math.ceil(totalOrders / pageSize),
            },
        };
    }
    catch (err) {
        throw err;
    }
});
exports.getWorkerOrdersHistoryService = getWorkerOrdersHistoryService;
