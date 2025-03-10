import prisma from "../../prisma";
import { startOfMonth, endOfMonth, subDays, startOfDay, endOfDay, subWeeks, startOfWeek, endOfWeek } from "date-fns";
import { Prisma } from "../../../prisma/generated/client";

interface GetEmployeePerformanceQuery {
  filterOutlet?: number | string;
  filterMonth?: string;
  filterYear?: string;
  timeframe?: "daily" | "weekly" | "monthly";
  id: number;
}

export const getEmployeePerformanceService = async (
  query: GetEmployeePerformanceQuery
) => {
  try {
    const { id, filterOutlet = "all", filterMonth, filterYear, timeframe = "monthly" } = query;

    console.log("Employee performance query:", {
      id,
      filterOutlet,
      filterMonth,
      filterYear,
      timeframe
    });

    const existingUser = await prisma.user.findFirst({
      where: { id },
      select: { employee: { select: { outletId: true } }, role: true },
    });

    if (!existingUser) throw new Error("User not found!");

    const whereClause: Prisma.OrderWorkerWhereInput = {};

    // Handle outlet filtering
    if (existingUser.role !== "SUPER_ADMIN") {
      whereClause.worker = {
        outletId: existingUser.employee?.outletId ?? undefined,
      };
    } else if (filterOutlet !== "all") {
      whereClause.worker = {
        outletId: Number(filterOutlet),
      };
    }

    // Calculate date range based on timeframe
    const now = new Date();
    let dateStart: Date;
    let dateEnd: Date;
    
    // If month and year are provided, use them
    if (filterMonth && filterYear) {
      const month = Number(filterMonth) - 1; // JS months are 0-indexed
      const year = Number(filterYear);
      
      dateStart = startOfMonth(new Date(year, month));
      dateEnd = endOfMonth(new Date(year, month));
    } else {
      // Otherwise use timeframe
      switch (timeframe) {
        case "daily":
          // Last 30 days
          dateStart = startOfDay(subDays(now, 29));
          dateEnd = endOfDay(now);
          break;
          
        case "weekly":
          // Last 12 weeks
          dateStart = startOfWeek(subWeeks(now, 11));
          dateEnd = endOfWeek(now);
          break;
          
        case "monthly":
        default:
          // Current month if no specific month/year
          dateStart = startOfMonth(now);
          dateEnd = endOfMonth(now);
      }
    }
    
    // Set date filter
    whereClause.createdAt = {
      gte: dateStart,
      lte: dateEnd,
    };

    console.log("Date range:", {
      start: dateStart.toISOString(),
      end: dateEnd.toISOString()
    });
    
    console.log("whereClause:", JSON.stringify(whereClause, null, 2));

    const employeePerformances = await prisma.orderWorker.findMany({
      where: whereClause,
      include: {
        worker: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
            outlet: {
              select: {
                outletName: true,
              },
            },
          },
        },
      },
    });

    console.log(`Found ${employeePerformances.length} employee performance records`);

    const performanceMap = new Map<number, { count: number; data: any }>();

    employeePerformances.forEach((record) => {
      const worker = record.worker;
      if (!worker || !worker.user) return;

      const userId = worker.user.id;
      if (!performanceMap.has(userId)) {
        performanceMap.set(userId, {
          count: 0,
          data: {
            userId,
            fullName: worker.user.fullName || "Unknown",
            email: worker.user.email || "Unknown",
            outlet: worker.outlet?.outletName || "No Outlet",
          },
        });
      }

      performanceMap.get(userId)!.count += 1;
    });

    const performanceReport = Array.from(performanceMap.values()).map((item) => ({
      ...item.data,
      taskCompleted: item.count,
    }));

    return {
      message: "Successfully fetched employee performance",
      result: { 
        performanceReport,
        timeframe,
        dateRange: {
          from: dateStart,
          to: dateEnd
        }
      },
    };
  } catch (error) {
    console.error("Error fetching employee performance:", error);
    throw error;
  }
};