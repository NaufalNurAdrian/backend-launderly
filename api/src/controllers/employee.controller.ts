import { Request, Response } from "express";
import { addEmployeeService } from "../services/employee/addEmployee.service";
import { getAllEmployeeService } from "../services/employee/getAllEmployee.service";
import { UpdateEmployeeInput, updateEmployeeService } from"../services/employee/updateEmployee.service";
import { deleteEmployeeService } from "../services/employee/deleteEmployeeService";

export class EmployeeController {
  async addEmployee(req: Request, res: Response) {
    try {
      const result = await addEmployeeService(req.body, req);
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

  
}
