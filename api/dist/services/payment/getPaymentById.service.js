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
exports.getUserPaymentsService = void 0;
const prisma_1 = __importDefault(require("../../prisma")); // Sesuaikan dengan path Prisma Anda
const getUserPaymentsService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userId) {
        throw new Error("User ID is required");
    }
    const payments = yield prisma_1.default.payment.findMany({
        where: {
            order: {
                pickupOrder: {
                    userId: userId,
                },
            },
        },
        select: {
            id: true,
            invoiceNumber: true,
            amount: true,
            paymentMethode: true,
            paymentStatus: true,
            snapRedirectUrl: true,
            createdAt: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return payments;
});
exports.getUserPaymentsService = getUserPaymentsService;
