import prisma from "../../prisma";

export const getAllEmployeeService = async () => {
  try {
    const employee = await prisma.employee.findFirst({
      include: {
        user: true,
        outlet: true,
      },
    });
    return employee;
  } catch (error: any) {
    throw new Error(error.message || "Failed to get employee");
  }
};
