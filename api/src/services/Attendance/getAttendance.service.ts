import { Prisma } from "@prisma/client";
import prisma from "../../prisma";

interface GetAttendanceQuery {
  userId: number;
  sortBy?: string;
  order?: string;
  page?: number;
  pageSize?: number;
}

export const getAttendanceService = async (query: GetAttendanceQuery) => {
  try {
    const { userId, sortBy, order, page = 1, pageSize = 6 } = query;

    const skip = (page - 1) * pageSize;
    let orderBy: Record<string, "asc" | "desc"> = {};

    if (sortBy && (sortBy === "createdAt" || sortBy === "workHour")) {
      const sortOrder = order === "desc" ? "desc" : "asc";
      orderBy[sortBy] = sortOrder;
    }

    const totalAttendances = await prisma.attendance.count();

    const result = await prisma.attendance.findMany({
      where: {
        userId: userId,
      },
      include: {
        user: true,
      },
      orderBy: orderBy,
      skip: skip,
      take: pageSize,
    });

    return {
      data: result,
      pagination: {
        total: totalAttendances,
        page: page,
        pageSize: pageSize,
        totalPages: Math.ceil(totalAttendances / pageSize),
      },
    };
  } catch (err) {
    throw err;
  }
};
