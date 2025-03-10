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
exports.getAttendancesService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const getAttendancesService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, sortBy, order, page = 1, pageSize = 5 } = query;
        const skip = (page - 1) * pageSize;
        let orderBy = {};
        if (sortBy && (sortBy === "createdAt" || sortBy === "workHour")) {
            const sortOrder = order === "desc" ? "desc" : "asc";
            orderBy[sortBy] = sortOrder;
        }
        const totalAttendances = yield prisma_1.default.attendance.count({
            where: {
                userId: userId,
            },
        });
        const result = yield prisma_1.default.attendance.findMany({
            where: {
                userId: userId,
            },
            include: {
                user: true,
            },
            orderBy: orderBy,
            skip: skip,
            take: pageSize,
        });
        return {
            data: result,
            pagination: {
                total: totalAttendances,
                page: page,
                pageSize: pageSize,
                totalPages: Math.ceil(totalAttendances / pageSize),
            },
        };
    }
    catch (err) {
        throw err;
    }
});
exports.getAttendancesService = getAttendancesService;
