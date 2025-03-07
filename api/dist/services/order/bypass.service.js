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
exports.bypassOrderService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const bypassOrderService = (body) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { action, orderWorkerId } = body;
        const orderWorker = yield prisma_1.default.orderWorker.findUnique({
            where: { id: orderWorkerId },
            select: { bypassRequest: true, bypassAccepted: true, bypassRejected: true },
        });
        if (!orderWorker) {
            throw new Error("Order Worker tidak ditemukan!");
        }
        if (!orderWorker.bypassRequest) {
            throw new Error("Tidak ada permintaan bypass untuk order ini!");
        }
        if (action === "accept" && orderWorker.bypassAccepted) {
            throw new Error("Bypass sudah diterima sebelumnya!");
        }
        if (action === "reject" && orderWorker.bypassRejected) {
            throw new Error("Bypass sudah ditolak sebelumnya!");
        }
        const updateData = action === "accept"
            ? { bypassAccepted: true, bypassRejected: false, bypassRequest: false }
            : { bypassRejected: true, bypassAccepted: false, isComplete: false, bypassRequest: false, };
        return yield prisma_1.default.orderWorker.update({
            where: { id: orderWorkerId },
            data: updateData,
        });
    }
    catch (error) {
        console.error("Bypass Order Error:", error.message);
        throw new Error(error.message);
    }
});
exports.bypassOrderService = bypassOrderService;
