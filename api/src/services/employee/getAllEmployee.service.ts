import prisma from "../../prisma";

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
};
