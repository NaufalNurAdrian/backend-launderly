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
exports.deleteEmployeeService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const deleteEmployeeService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employee = yield prisma_1.default.employee.findFirst({
            where: { id: Number(id) },
            include: { user: true },
        });
        if (!employee) {
            throw new Error("Employee not found");
        }
        const updateEmployee = yield prisma_1.default.user.update({
            where: { id: employee.userId },
            data: { isDelete: true },
        });
        return updateEmployee;
    }
    catch (error) {
        throw new Error(error.message || "Failed to delete employee");
    }
});
exports.deleteEmployeeService = deleteEmployeeService;
