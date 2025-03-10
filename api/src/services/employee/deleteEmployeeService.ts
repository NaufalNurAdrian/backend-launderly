import prisma from "../../prisma";

export const deleteEmployeeService = async (id: string) => {
  try {
    const employee = await prisma.employee.findFirst({
      where: { id: Number(id) },
      include: { user: true },
    });
    if (!employee) {
      throw new Error("Employee not found");
    }

    const updateEmployee = await prisma.user.update({
      where: { id: employee.userId },
      data: { isDelete: true },
    });
    return updateEmployee
  } catch (error: any) {
    throw new Error(error.message || "Failed to delete employee");
  }
};
