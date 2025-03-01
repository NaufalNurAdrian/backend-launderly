import prisma from "../../prisma";

<<<<<<< HEAD
export const getAllEmployeeService = async (page: number = 1, pageSize: number = 5) => {
    try {
        const offset = (page - 1) * pageSize;

        const totalEmployees = await prisma.employee.count({
            where: { user: { isDelete: false } }
        });

        const employees = await prisma.employee.findMany({
            skip: offset,
            take: pageSize,
            select: {
                id: true,
                workShift: true, 
                station: true,
                user: true,
                outlet: true
            },
            where: { user: { isDelete: false } }
        });

        return {
            employees,
            totalPages: Math.ceil(totalEmployees / pageSize),
            currentPage: page,
        };
    } catch (error: any) {
        throw new Error(error.message || "Failed to get employee");
    }
=======
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
>>>>>>> f4e245107b518e906d0cc98fa8b9c7a2e3d7f718
};
