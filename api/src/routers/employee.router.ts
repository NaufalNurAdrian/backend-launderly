import { Router } from "express";
import { EmployeeController } from "../controllers/employee.controller";


export class EmployeeRouter {
    private employeeController: EmployeeController;
    private router: Router  ;

    constructor() {
        this.employeeController = new EmployeeController();
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post("/create", this.employeeController.addEmployee);
    }

    getRouter() {
        return this.router;
    }
}