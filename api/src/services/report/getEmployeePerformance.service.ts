import prisma from "../../prisma";
import { startOfMonth, endOfMonth } from "date-fns";

interface GetEmployeePerformanceQuery {
  filterOutlet?: number | string; // Opsional, default "all"
  filterMonth?: string; // Opsional
  filterYear?: string; // Opsional
  id: number;
}

export const getEmployeePerformanceService = async (query: GetEmployeePerformanceQuery) => {
  try {
    const { id, filterOutlet = "all", filterMonth, filterYear } = query;

    // Cek apakah user ada
    const existingUser = await prisma.user.findFirst({
      where: { id },
      select: { employee: { select: { outletId: true } }, role: true },
    });

    if (!existingUser) throw new Error("User not found!");

    const whereClause: any = {};

    // Outlet Admin hanya bisa melihat outletnya sendiri
    if (existingUser.role !== "SUPER_ADMIN") {
      whereClause.outletId = existingUser.employee?.outletId;
    } else if (filterOutlet !== "all") {
      whereClause.outletId = Number(filterOutlet);
    }

    // Gunakan bulan & tahun saat ini jika tidak diberikan
    const now = new Date();
    const month = filterMonth ? Number(filterMonth) - 1 : now.getMonth();
    const year = filterYear ? Number(filterYear) : now.getFullYear();

    // Filter berdasarkan tanggal jika ada
    if (filterMonth || filterYear) {
      whereClause.createdAt = {
        gte: startOfMonth(new Date(year, month)),
        lte: endOfMonth(new Date(year, month)),
      };
    }

    console.log("whereClause:", JSON.stringify(whereClause, null, 2));

    // Ambil data performa karyawan
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

    // Hitung jumlah pekerjaan per karyawan
    const performanceMap: Record<number, { count: number; data: any }> = {};

    employeePerformances.forEach((record) => {
      const worker = record.worker;
      if (!worker) return;

      const userId = worker.user?.id || 0;
      if (!performanceMap[userId]) {
        performanceMap[userId] = {
          count: 0,
          data: {
            userId,
            fullName: worker.user?.fullName || "Unknown",
            email: worker.user?.email || "Unknown",
            outlet: worker.outlet?.outletName || "No Outlet",
            shift: worker.workShift || "Unknown",
          },
        };
      }
      performanceMap[userId].count += 1;
    });

    // Konversi ke array
    const performanceReport = Object.values(performanceMap).map((item) => ({
      ...item.data,
      taskCompleted: item.count,
    }));

    return {
      message: "Successfully fetched employee performance",
      result: {
        performanceReport,
      },
    };
  } catch (error) {
    console.error("Error fetching employee performance:", error);
    throw error;
  }
};
