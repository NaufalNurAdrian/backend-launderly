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
exports.updateEmployeeService = void 0;
const prisma_1 = __importDefault(require("../../prisma"));
const updateEmployeeService = (data, id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employeeId = parseInt(id);
        if (isNaN(employeeId))
            throw new Error("Invalid employee ID");
        const employee = yield prisma_1.default.employee.findUnique({
            where: { id: employeeId },
            include: { user: true },
        });
        if (!employee)
            throw new Error("Employee not found");
        const updateData = {};
        let hasUserUpdates = false;
        if (data.workShift && data.workShift !== employee.workShift) {
            updateData.workShift = data.workShift;
        }
        if (data.station && data.station !== employee.station) {
            updateData.station = data.station;
        }
        if (data.outletId && data.outletId !== employee.outletId) {
            const outlet = yield prisma_1.default.outlet.findUnique({
                where: { id: data.outletId },
            });
            if (!outlet)
                throw new Error("Outlet not found");
            updateData.outletId = data.outletId;
        }
        const userUpdate = {};
        if (data.fullName && data.fullName !== employee.user.fullName) {
            userUpdate.fullName = data.fullName;
            hasUserUpdates = true;
        }
        if (data.email && data.email !== employee.user.email) {
            userUpdate.email = data.email;
            hasUserUpdates = true;
        }
        if (data.password) {
            userUpdate.password = data.password;
            hasUserUpdates = true;
        }
        if (data.role && data.role !== employee.user.role) {
            userUpdate.role = data.role;
            hasUserUpdates = true;
        }
        if (hasUserUpdates) {
            updateData.user = {
                update: userUpdate,
            };
        }
        if (Object.keys(updateData).length === 0) {
            throw new Error("No changes detected");
        }
        return yield prisma_1.default.employee.update({
            where: { id: employeeId },
            data: updateData,
            include: { outlet: true, user: true },
        });
    }
    catch (error) {
        console.error("Update Employee Error:", error);
        throw new Error(error instanceof Error ? error.message : "Update failed");
    }
});
exports.updateEmployeeService = updateEmployeeService;
