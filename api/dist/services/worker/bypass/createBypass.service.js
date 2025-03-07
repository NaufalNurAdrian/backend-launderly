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
exports.createBypass = void 0;
const prisma_1 = __importDefault(require("../../../prisma"));
const createBypass = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const { bypassNote, orderId, workerId } = query;
    try {
        const worker = yield prisma_1.default.employee.findUnique({
            where: { userId: workerId },
            include: {
                outlet: true,
                user: {
                    select: { fullName: true },
                },
            },
        });
        if (!worker)
            throw new Error("Worker not found");
        const order = yield prisma_1.default.order.findUnique({
            where: { id: orderId },
        });
        if (!order)
            throw new Error("Order not found");
        const orderWorker = yield prisma_1.default.orderWorker.findFirst({
            where: {
                orderId: orderId,
                workerId: worker.id,
            },
        });
        if (!orderWorker)
            throw new Error("OrderWorker not found for the given order and worker");
        const requestedBypass = yield prisma_1.default.orderWorker.update({
            where: { id: orderWorker.id },
            data: {
                bypassRequest: true,
                bypassNote: bypassNote,
            },
        });
        const notification = yield prisma_1.default.notification.create({
            data: {
                title: "New Bypass Request",
                description: `New bypass request from ${worker.user.fullName}.`,
            },
        });
        const outletAdmins = yield prisma_1.default.user.findMany({
            where: {
                role: "OUTLET_ADMIN",
                employee: {
                    outletId: worker.outletId,
                },
            },
        });
        yield Promise.all(outletAdmins.map((user) => __awaiter(void 0, void 0, void 0, function* () {
            yield prisma_1.default.userNotification.create({
                data: {
                    userId: user.id,
                    notificationId: notification.id,
                },
            });
        })));
        return requestedBypass;
    }
    catch (error) {
        console.error("Error creating OrderWorker:", error);
        throw error;
    }
});
exports.createBypass = createBypass;
