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
exports.getAllEmployeeService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const getAllEmployeeService = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (page = 1, pageSize = 5) {
    try {
        const offset = (page - 1) * pageSize;
        const totalEmployees = yield prisma_1.default.employee.count({
            where: { user: { isDelete: false } }
        });
        const employees = yield prisma_1.default.employee.findMany({
            skip: offset,
            take: pageSize,
            select: {
                id: true,
                workShift: true,
                station: true,
                user: true,
                outlet: true
            },
            where: { user: { isDelete: false } }
        });
        return {
            employees,
            totalPages: Math.ceil(totalEmployees / pageSize),
            currentPage: page,
        };
    }
    catch (error) {
        throw new Error(error.message || "Failed to get employee");
    }
});
exports.getAllEmployeeService = getAllEmployeeService;
