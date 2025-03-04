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
exports.getAllAttendancesService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const getAllAttendancesService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { userId, outletId, sortBy, order, page = 1, pageSize = 20, role } = query;
        const skip = (page - 1) * pageSize;
        const user = yield prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { role: true, employee: { select: { outletId: true } } },
        });
        if (!user) {
            throw new Error("unAuthorized");
        }
        const userRole = user.role;
        const userOutletId = (_a = user.employee) === null || _a === void 0 ? void 0 : _a.outletId;
        if (userRole === "OUTLET_ADMIN" && outletId !== userOutletId) {
            throw new Error("Admin outlet can only access data of their outlet.");
        }
        let filter = {};
        if (userRole === "OUTLET_ADMIN") {
            filter = {
                user: {
                    employee: {
                        outletId: userOutletId
                    },
                },
            };
        }
        if (role) {
            filter.user = filter.user || {};
            filter.user.role = role;
        }
        let orderBy = {};
        if (sortBy && (sortBy === 'createdAt' || sortBy === 'workHour')) {
            const sortOrder = order === 'desc' ? 'desc' : 'asc';
            orderBy[sortBy] = sortOrder;
        }
        const result = yield prisma_1.default.attendance.findMany({
            where: filter,
            include: {
                user: {
                    include: {
                        employee: {
                            select: {
                                outletId: true,
                            },
                        },
                    },
                },
            },
            orderBy: orderBy,
            skip: skip,
            take: pageSize,
        });
        const totalAttendances = yield prisma_1.default.attendance.count({
            where: filter,
        });
        return { data: result,
            pagination: {
                total: totalAttendances,
                page: page,
                pageSize: pageSize,
                totalPages: Math.ceil(totalAttendances / pageSize),
            }
        };
    }
    catch (err) {
        throw err;
    }
});
exports.getAllAttendancesService = getAllAttendancesService;
