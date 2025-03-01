import prisma from "../../prisma";
import { EmployeeWorkShift, EmployeeStation } from "@prisma/client";

export interface UpdateEmployeeInput {
  workShift?: EmployeeWorkShift;
  station?: EmployeeStation;
  outletId?: number;
}

export const updateEmployeeService = async (data: UpdateEmployeeInput, id: number) => {
  try {
    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) throw new Error("Employee not found");

    const updateData: any = {
      workShift: data.workShift,
      station: data.station,
    };

    if (data.outletId) {
      const outlet = await prisma.outlet.findUnique({
        where: { id: data.outletId },
      });
      if (!outlet) throw new Error("Outlet not found");
      updateData.outletId = data.outletId;
    }

    return await prisma.employee.update({
      where: { id },
      data: updateData,
      include: { outlet: true },
    });
  } catch (error) {
    console.error("Update Employee Error:", error);
    throw new Error(error instanceof Error ? error.message : "Update failed");
  }
};
