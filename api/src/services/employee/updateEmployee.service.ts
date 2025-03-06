import prisma from "../../prisma";
import { EmployeeWorkShift, EmployeeStation, Role } from "@prisma/client";

export interface UpdateEmployeeInput {
  workShift?: EmployeeWorkShift;
  station?: EmployeeStation;
  outletId?: number;
  fullName?: string;
  email?: string;
  password?: string;
  role?: Role;
}

// Interface untuk user update
interface UserUpdateInput {
  fullName?: string;
  email?: string;
  password?: string;
  role?: Role;
}

<<<<<<< HEAD
export const updateEmployeeService = async (data: UpdateEmployeeInput, id: string) => {
=======
export const updateEmployeeService = async (
  data: UpdateEmployeeInput,
  id: string
) => {
>>>>>>> 61033c123996b9f5e12fc8ca849b5eafb694105f
  try {
    const employeeId = parseInt(id);
    if (isNaN(employeeId)) throw new Error("Invalid employee ID");

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { user: true },
    });

    if (!employee) throw new Error("Employee not found");

    const updateData: any = {};
    let hasUserUpdates = false;

    if (data.workShift && data.workShift !== employee.workShift) {
      updateData.workShift = data.workShift;
    }

    if (data.station && data.station !== employee.station) {
      updateData.station = data.station;
    }

    if (data.outletId && data.outletId !== employee.outletId) {
      const outlet = await prisma.outlet.findUnique({
        where: { id: data.outletId },
      });

      if (!outlet) throw new Error("Outlet not found");
      updateData.outletId = data.outletId;
    }

    // Persiapkan objek untuk user update dengan tipe yang tepat
    const userUpdate: UserUpdateInput = {};

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

    // Siapkan data update untuk user jika ada perubahan
    if (hasUserUpdates) {
      updateData.user = {
<<<<<<< HEAD
        update: userUpdate
=======
        update: userUpdate,
>>>>>>> 61033c123996b9f5e12fc8ca849b5eafb694105f
      };
    }

    // Periksa apakah ada perubahan pada level atas ATAU pada level user
    if (Object.keys(updateData).length === 0) {
      throw new Error("No changes detected");
    }

    return await prisma.employee.update({
      where: { id: employeeId },
      data: updateData,
      include: { outlet: true, user: true },
    });
  } catch (error) {
    console.error("Update Employee Error:", error);
    throw new Error(error instanceof Error ? error.message : "Update failed");
  }
};