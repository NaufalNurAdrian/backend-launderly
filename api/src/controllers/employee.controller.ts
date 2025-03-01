import { Request, Response } from "express";
import { addEmployeeService } from "../services/employee/addEmployee.service";
import { getAllEmployeeService } from "../services/employee/getAllEmployee.service";
<<<<<<< HEAD
import { UpdateEmployeeInput, updateEmployeeService } from"../services/employee/updateEmployee.service";
import { deleteEmployeeService } from "../services/employee/deleteEmployeeService";
=======
import { UpdateEmployeeInput, updateEmployeeService } from "../services/employee/updateEmployee.service";
>>>>>>> f4e245107b518e906d0cc98fa8b9c7a2e3d7f718

export class EmployeeController {
  async addEmployee(req: Request, res: Response) {
    try {
<<<<<<< HEAD
      const result = await addEmployeeService(req.body, req);
=======
      const { fullName, email, password, outletId, role } = req.body;

      if (!fullName || !email || !password || !outletId || !role) {
        res.status(400).send({ message: "Missing required fields" });
      }

      const result = await addEmployeeService(req.body);

>>>>>>> f4e245107b518e906d0cc98fa8b9c7a2e3d7f718
      res.status(201).send({ message: "Employee added successfully", result });
    } catch (error: any) {
      res.status(400).send({ message: error.message });
    }
  }
  

  async getAllEmployee(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 5;
  
      const result = await getAllEmployeeService(page, pageSize);
  
      res.status(200).send({
        message: "Employee fetched successfully",
        ...result,
      });
    } catch (error: any) {
      res.status(500).send({ message: error.message });
    }
  }
<<<<<<< HEAD
  
=======

  async getAllEmployee(req: Request, res: Response) {
    try {
      const result = await getAllEmployeeService();
      res.status(200).send({ message: "Employee get successfully", result });
    } catch (error: any) {
      res.status(500).send({ message: error.message });
    }
  }
>>>>>>> f4e245107b518e906d0cc98fa8b9c7a2e3d7f718

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
        outletId: outletId ? Number(outletId) : undefined,
      };

      const result = await updateEmployeeService(updateData, id);
      res.status(200).send({
        message: "Employee updated successfully",
        result,
      });
    } catch (error: any) {
      res.status(500).send({
        message: error.message || "Failed to update employee",
      });
    }
  }
<<<<<<< HEAD

  async deleteEmployee(req: Request, res: Response) {
    try {
      const result = await deleteEmployeeService(
        Number(req.params.id)      
      );
      res.status(200).send({ message: "Employee deleted successfully", result });
    } catch (error: any) {
      res.status(500).send({message: error.message})
    }
  }

  
=======
>>>>>>> f4e245107b518e906d0cc98fa8b9c7a2e3d7f718
}
