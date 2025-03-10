"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeRouter = void 0;
const express_1 = require("express");
const employee_controller_1 = require("../controllers/employee.controller");
const verify_1 = require("../middlewares/verify");
class EmployeeRouter {
    constructor() {
        this.employeeController = new employee_controller_1.EmployeeController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/create", verify_1.verifyToken, verify_1.checkSuperAdmin, this.employeeController.addEmployee);
        this.router.get("/", verify_1.verifyToken, verify_1.checkSuperAdmin, this.employeeController.getAllEmployee);
        this.router.get("/:id", verify_1.verifyToken, verify_1.checkSuperAdmin, this.employeeController.getEmployeeById);
        this.router.patch("/delete", verify_1.verifyToken, verify_1.checkSuperAdmin, this.employeeController.deleteEmployee);
        this.router.patch("/update/:id", verify_1.verifyToken, verify_1.checkSuperAdmin, this.employeeController.updateEmployee);
    }
    getRouter() {
        return this.router;
    }
}
exports.EmployeeRouter = EmployeeRouter;
