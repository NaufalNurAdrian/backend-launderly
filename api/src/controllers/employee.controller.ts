import { Request, Response } from "express";
import { addEmployeeService } from "../services/employee/addEmployee.service";
import { getAllEmployeeService } from "../services/employee/getAllEmployee.service";
import { UpdateEmployeeInput, updateEmployeeService } from"../services/employee/updateEmployee.service";

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

  async getAllEmployee(req: Request, res: Response) {
    try {
      const result = await getAllEmployeeService();
      res.status(200).send({ message: "Employee get successfully", result });
    } catch (error: any) {
      res.status(500).send({ message: error.message });
    }
  } 

  async updateEmployee(req: Request, res: Response) { 
    try {
      const { workShift, station, outletId } = req.body;
      const id = Number(req.params.id);

      if (!id || isNaN(id)) {
        res.status(400).send({ message: "Invalid employee ID" });
      }

      const updateData: UpdateEmployeeInput = {
        workShift,
        station,
        outletId: outletId ? Number(outletId) : undefined
      };

      const result = await updateEmployeeService(updateData, id);
      res.status(200).send({ 
        message: "Employee updated successfully", 
        result 
      });
      
    } catch (error: any) {
      res.status(500).send({ 
        message: error.message || "Failed to update employee"
      });
    }
  }

}
