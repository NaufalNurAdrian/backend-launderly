import { Router } from "express";
import { EmployeeController } from "../controllers/employee.controller";
import { checkSuperAdmin, verifyToken } from "../middlewares/verify";

export class EmployeeRouter {
  private employeeController: EmployeeController;
  private router: Router;

  constructor() {
    this.employeeController = new EmployeeController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/create",
      verifyToken,
      checkSuperAdmin,
      this.employeeController.addEmployee
    );
    this.router.get(
      "/",
      verifyToken,
      checkSuperAdmin,
      this.employeeController.getAllEmployee
    );
    this.router.get("/:id", verifyToken, checkSuperAdmin, this.employeeController.getEmployeeById);
    this.router.patch("/delete", verifyToken, checkSuperAdmin, this.employeeController.deleteEmployee)
    this.router.patch(
      "/update/:id",
      verifyToken,
      checkSuperAdmin,
      this.employeeController.updateEmployee
    );
  }

  getRouter() {
    return this.router;
  }
}
