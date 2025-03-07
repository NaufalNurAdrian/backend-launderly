import prisma from "../../prisma";

interface GetAllAttendancesQuery {
    userId?: number; 
    outletId?: number; 
    sortBy?: 'createdAt' | 'workHour' ; 
    order?: 'asc' | 'desc';
    page?: number; 
    pageSize?: number; 
    role?: 'WORKER' | 'DRIVER';
}

export const getAllAttendancesService = async (query: GetAllAttendancesQuery) => {
    try {
        const { userId, outletId, sortBy, order, page = 1, pageSize = 20, role  } = query;
        const skip = (page - 1) * pageSize;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, employee: { select: { outletId: true } } },
        });

        if (!user) {
            throw new Error("unAuthorized");
        }
        
        const userRole = user.role;
        const userOutletId = user.employee?.outletId;

        if (userRole === "OUTLET_ADMIN" && outletId !== userOutletId) {
            throw new Error("Admin outlet can only access data of their outlet.");
        }

        let filter: any = {};
        if (userRole === "OUTLET_ADMIN") {
            filter = {
                user: {
                    employee: {
                        outletId: userOutletId
                    },
                },
            };
        }

        if (role) {
            filter.user = filter.user || {};
            filter.user.role = role;
        }

        let orderBy: Record<string, 'asc' | 'desc'> = {};

        if (sortBy && (sortBy === 'createdAt' || sortBy === 'workHour' )) {
            const sortOrder = order === 'desc' ? 'desc' : 'asc';
                orderBy[sortBy] = sortOrder;
        }

        const result = await prisma.attendance.findMany({
            where: filter, 
            include: {
                user: {
                    include: {
                        employee: {
                            select: {
                                outletId: true,
                            },
                        },
                    },
                },
            },
            orderBy: orderBy, 
            skip: skip, 
            take: pageSize, 
        });

        const totalAttendances = await prisma.attendance.count({
            where: filter,
        });

        return {
            data: result, 
            pagination: {
                total: totalAttendances,
                page: page,
                pageSize: pageSize,
                totalPages: Math.ceil(totalAttendances / pageSize),
            }
        };
    } catch (err) {
        throw err;
    }
};