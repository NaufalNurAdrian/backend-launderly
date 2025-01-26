import { Request, Response } from "express";
import { addEmployeeService } from "../services/employee/employee.service";

export class EmployeeController {
  async addEmployee(req: Request, res: Response) {
    try {
      const { fullName, email, password, outletId, role} = req.body;

      if (!fullName || !email || !password || !outletId || !role) {
        res.status(400).send({ message: "Missing required fields" });
      }

      const result = await addEmployeeService(req.body);

      res.status(201).send({ message: "Employee added successfully", result });
    } catch (error: any) {
      res.status(500).send({ message: error.message });
    }
  }
}
