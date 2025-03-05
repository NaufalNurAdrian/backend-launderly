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
exports.getWorkerOrdersService = void 0;
const client_1 = require("prisma/generated/client");
const prisma_1 = __importDefault(require("../../../prisma"));
const getWorkerOrdersService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { workerId, order, page = 1, pageSize = 4, sortBy } = query;
        const worker = yield prisma_1.default.user.findUnique({
            where: { id: workerId, role: "WORKER" },
        });
        if (!worker) {
            throw new Error("unauthorized, are you a worker ?");
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const attendance = yield prisma_1.default.attendance.findFirst({
            where: {
                userId: workerId,
                createdAt: {
                    gte: today,
                },
                attendanceStatus: "ACTIVE",
            },
        });
        if (!attendance) {
            throw new Error("you haven't check in or you're already checked out");
        }
        const workerStation = yield prisma_1.default.employee.findFirst({
            where: {
                userId: workerId,
            },
        });
        if (!workerStation) {
            throw new Error("Worker Station undefied");
        }
        const station = workerStation.station;
        const orderStatus = station === "WASHING" ? client_1.OrderStatus.READY_FOR_WASHING : station === "IRONING" ? client_1.OrderStatus.WASHING_COMPLETED : client_1.OrderStatus.IRONING_COMPLETED;
        const whereClause = {
            AND: [
                {
                    OR: [
                        {
                            orderStatus: orderStatus,
                        },
                        {
                            orderStatus: station === "WASHING" ? client_1.OrderStatus.BEING_WASHED : station === "IRONING" ? client_1.OrderStatus.BEING_IRONED : client_1.OrderStatus.BEING_PACKED,
                            orderWorker: {
                                some: {
                                    workerId: workerStation.id,
                                },
                            },
                        },
                    ],
                },
                {
                    OR: [
                        {
                            orderWorker: {
                                some: {
                                    bypassAccepted: true,
                                    bypassRequest: false,
                                    station: station,
                                },
                            },
                        },
                        {
                            orderWorker: {
                                some: {
                                    bypassRejected: true,
                                    station: station,
                                },
                            },
                        },
                        {
                            orderWorker: {
                                none: {
                                    bypassRequest: true,
                                    bypassAccepted: false,
                                    station: station,
                                },
                            },
                        },
                    ],
                },
            ],
        };
        const orderByClause = {};
        if (sortBy === "weight") {
            orderByClause.weight = order;
        }
        else {
            orderByClause.createdAt = order;
        }
        const orders = yield prisma_1.default.order.findMany({
            where: whereClause,
            include: {
                orderItem: true,
                orderWorker: true,
                pickupOrder: {
                    include: {
                        user: true,
                    },
                },
            },
            orderBy: orderByClause,
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
exports.getWorkerOrdersService = getWorkerOrdersService;
