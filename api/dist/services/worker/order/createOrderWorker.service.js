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
exports.createOrderWorker = void 0;
const prisma_1 = __importDefault(require("../../../prisma"));
const createOrderWorker = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const { workerId, orderId } = query;
    return yield prisma_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        const pendingBypassOrder = yield prisma.orderWorker.findFirst({
            where: {
                orderId,
                bypassRequest: true,
                AND: [{ bypassAccepted: false }, { bypassRejected: false }],
            },
        });
        if (pendingBypassOrder) {
            throw new Error("Order has a pending bypass request.");
        }
        const worker = yield prisma.employee.findUnique({
            where: { userId: workerId },
        });
        if (!worker) {
            throw new Error("Worker not found");
        }
        const station = worker.station;
        const newStatus = station === "WASHING" ? "BEING_WASHED" : station === "IRONING" ? "BEING_IRONED" : "BEING_PACKED";
        yield prisma.order.update({
            where: { id: orderId },
            data: { orderStatus: newStatus },
        });
        const orderWorker = yield prisma.orderWorker.create({
            data: {
                orderId,
                workerId: worker.id,
                station: worker.station,
                isComplete: false,
            },
        });
        return orderWorker;
    }));
});
exports.createOrderWorker = createOrderWorker;
