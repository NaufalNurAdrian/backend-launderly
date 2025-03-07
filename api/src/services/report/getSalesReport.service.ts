import prisma from "../../prisma";
import { Prisma } from "@prisma/client";
import {
  endOfMonth,
  startOfMonth,
  getDaysInMonth,
  startOfYear,
  endOfYear,
} from "date-fns";

interface GetSalesReportQuery {
  filterOutlet: number | string;
  filterMonth: string;
  filterYear: string;
  id: number;
}

export const getSalesReportService = async (query: GetSalesReportQuery) => {
  try {
    const { id, filterOutlet, filterMonth, filterYear } = query;

    // Cek User
    const existingUser = await prisma.user.findFirst({
      where: { id },
      select: {
        employee: { select: { outlet: { select: { id: true } } } },
        role: true,
      },
    });

    if (!existingUser) throw new Error("User not found!");

    const whereClause: Prisma.PaymentWhereInput = {
      paymentStatus: "SUCCESSED",
    };

    // Outlet Admin hanya bisa melihat outletnya sendiri
    if (existingUser.role !== "SUPER_ADMIN") {
      whereClause.order = {
        pickupOrder: { outletId: existingUser.employee?.outlet?.id },
      };
    } else if (filterOutlet !== "all") {
      whereClause.order = {
        pickupOrder: { outletId: Number(filterOutlet) },
      };
    }

    const orders = await prisma.order.findMany({
      where: whereClause.order,
    });

    let totalOrders = orders.length;
    let receivedAtOutlet = orders.filter(
      (order) => order.orderStatus === "ARRIVED_AT_OUTLET"
    ).length;
    let onProgress = orders.filter((order) =>
      [
        "READY_FOR_WASHING",
        "BEING_WASHED",
        "WASHING_COMPLETED",
        "BEING_IRONED",
        "IRONING_COMPLETED",
        "BEING_PACKED",
      ].includes(order.orderStatus)
    ).length;
    let completed = orders.filter(
      (order) => order.orderStatus === "COMPLETED"
    ).length;

    const now = new Date();
    const month = filterMonth ? Number(filterMonth) - 1 : now.getMonth();
    const year = filterYear ? Number(filterYear) : now.getFullYear();

    // Filter berdasarkan bulan & tahun
    const startDate = startOfMonth(new Date(year, month));
    const endDate = endOfMonth(new Date(year, month));
    whereClause.updatedAt = { gte: startDate, lte: endDate };

    // Ambil data pembayaran
    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: { order: true },
    });

    // Inisialisasi nilai total
    let totalIncome = 0;
    let totalTransaction = 0;
    let totalWeight = 0;

    const daysInMonth = getDaysInMonth(new Date(year, month));

    // Inisialisasi array untuk data harian
    const incomeDaily = new Array(daysInMonth).fill(0);
    const transactionDaily = new Array(daysInMonth).fill(0);
    const weightDaily = new Array(daysInMonth).fill(0);

    payments.forEach((payment) => {
      totalIncome += payment.amount;
      totalTransaction += 1;
      totalWeight += payment.order?.weight ?? 0;

      // Hitung data harian
      const dayIndex = new Date(payment.updatedAt).getDate() - 1;
      incomeDaily[dayIndex] += payment.amount;
      transactionDaily[dayIndex] += 1;
      weightDaily[dayIndex] += payment.order?.weight ?? 0;
    });

    // Inisialisasi array untuk data bulanan
    const incomeMonthly = new Array(12).fill(0);
    const transactionMonthly = new Array(12).fill(0);
    const weightMonthly = new Array(12).fill(0);

    // Inisialisasi array untuk data tahunan (5 tahun terakhir)
    const currentYear = new Date().getFullYear();
    const pastYears = Array.from(
      { length: 5 },
      (_, i) => currentYear - i
    ).reverse();
    const incomeYearly = new Array(5).fill(0);
    const transactionYearly = new Array(5).fill(0);
    const weightYearly = new Array(5).fill(0);

    // Ambil data per bulan dalam tahun yang dipilih
    for (let i = 0; i < 12; i++) {
      const monthStart = startOfMonth(new Date(year, i));
      const monthEnd = endOfMonth(new Date(year, i));

      const monthlyPayments = await prisma.payment.findMany({
        where: {
          ...whereClause,
          updatedAt: { gte: monthStart, lte: monthEnd },
        },
        include: { order: true },
      });

      monthlyPayments.forEach((payment) => {
        incomeMonthly[i] += payment.amount;
        transactionMonthly[i] += 1;
        weightMonthly[i] += payment.order?.weight ?? 0;
      });
    }

    // Ambil data tahunan untuk 5 tahun terakhir
    for (let i = 0; i < pastYears.length; i++) {
      const yearStart = startOfYear(new Date(pastYears[i], 0, 1));
      const yearEnd = endOfYear(new Date(pastYears[i], 11, 31));

      const yearlyPayments = await prisma.payment.findMany({
        where: {
          ...whereClause,
          updatedAt: { gte: yearStart, lte: yearEnd },
        },
        include: { order: true },
      });

      yearlyPayments.forEach((payment) => {
        incomeYearly[i] += payment.amount;
        transactionYearly[i] += 1;
        weightYearly[i] += payment.order?.weight ?? 0;
      });
    }

    return {
      message: "Successfully fetched sales report",
      result: {
        totalIncome,
        totalTransaction,
        totalOrders,
        receivedAtOutlet,
        onProgress,
        completed,
        totalWeight,
        incomeDaily,
        transactionDaily,
        weightDaily,
        incomeMonthly,
        transactionMonthly,
        weightMonthly,
        pastYears,
        incomeYearly,
        transactionYearly,
        weightYearly,
      },
    };
  } catch (error) {
    throw error;
  }
};
