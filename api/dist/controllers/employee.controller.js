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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeController = void 0;
const addEmployee_service_1 = require("../services/employee/addEmployee.service");
const getAllEmployee_service_1 = require("../services/employee/getAllEmployee.service");
const updateEmployee_service_1 = require("../services/employee/updateEmployee.service");
const deleteEmployeeService_1 = require("../services/employee/deleteEmployeeService");
const getEmployeeId_service_1 = require("../services/employee/getEmployeeId.service");
class EmployeeController {
    addEmployee(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield (0, addEmployee_service_1.addEmployeeService)(req.body, req);
                res.status(201).send({ message: "Employee added successfully", result });
            }
            catch (error) {
                res.status(400).send({ message: error.message });
            }
        });
    }
    getAllEmployee(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const pageSize = parseInt(req.query.pageSize) || 5;
                const result = yield (0, getAllEmployee_service_1.getAllEmployeeService)(page, pageSize);
                res.status(200).send(Object.assign({ message: "Employee fetched successfully" }, result));
            }
            catch (error) {
                res.status(500).send({ message: error.message });
            }
        });
    }
    updateEmployee(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { workShift, station, outletId, fullName, email, password, role } = req.body;
                console.log(req.body);
                const id = req.params.id;
                if (!id) {
                    res.status(400).send({ message: "Invalid employee ID" });
                }
                const updateData = {
                    workShift,
                    station,
                    outletId,
                    fullName,
                    email,
                    password,
                    role,
                };
                const result = yield (0, updateEmployee_service_1.updateEmployeeService)(updateData, id);
                res.status(200).send({
                    message: "Employee updated successfully",
                    result,
                });
            }
            catch (error) {
                res.status(500).send({
                    message: error.message || "Failed to update employee",
                });
            }
        });
    }
    deleteEmployee(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield (0, deleteEmployeeService_1.deleteEmployeeService)(Number(req.params.id));
                res
                    .status(200)
                    .send({ message: "Employee deleted successfully", result });
            }
            catch (error) {
                res.status(500).send({ message: error.message });
            }
        });
    }
    getEmployeeById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.id;
                if (!id) {
                    res.status(400).send({ message: "Employee ID is required" });
                }
                const employee = yield (0, getEmployeeId_service_1.getEmployeeIdService)(id);
                res
                    .status(200)
                    .send({ message: "Employee fetched successfully", employee });
            }
            catch (error) {
                res.status(500).send({ message: error.message });
            }
        });
    }
}
exports.EmployeeController = EmployeeController;
