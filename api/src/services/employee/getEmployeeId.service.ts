import prisma from "../../prisma";


export const getEmployeeIdService = async (id: string) => {
    try {
       const getEmployeeId = await prisma.employee.findUnique({
        where: { id: Number(id) },
        select: { user: true, station: true, workShift: true, outlet: true },
       })
       return getEmployeeId;
    } catch (error: any) {
        throw new Error(error.message);
        
    }
}