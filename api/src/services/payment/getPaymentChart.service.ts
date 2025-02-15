import prisma from "@/prisma";
import { Prisma } from "@prisma/client";
import { endOfMonth, getDaysInMonth } from 'date-fns';
import { body } from "express-validator";

interface GetPaymentChartQuery {
    id: number;
    filterOutlet: number | string;
    filterMonth: string;
    filterYear: string;
}

export const getPaymentChartService = async (query: GetPaymentChartQuery) => {
    try {
        const { id, filterMonth, filterOutlet, filterYear } = query;

        const existingUser = await prisma.user.findFirst({
            where: { id: id },
            select: { employee: { select: { outlet: { select: { id: true } } } }, role: true }
        })

        if (!existingUser) {
            throw new Error('User not Found!')
        }

        const whereClause: Prisma.PaymentWhereInput = {
            paymentStatus: "SUCCESSED"
        }

        if (existingUser.role != "SUPER_ADMIN") {
            const pickupOrders = await prisma.pickupOrder.findMany({
                where: { outletId: existingUser.employee?.outlet?.id },
                select: { id: true }
            })

            const pickupOrderIds = pickupOrders.map(pickup => pickup.id);

            const orders = await prisma.order.findMany({
                where: { pickupOrderId: { in: pickupOrderIds } },
                select: { id: true }
            })

            const orderIds = orders.map(order => order.id)

            whereClause.orderId = { in: orderIds }
        } else {
            if (filterOutlet != "all") {
                const pickupOrders = await prisma.pickupOrder.findMany({
                    where: { outletId: Number(filterOutlet) },
                    select: { id: true }
                })

                const pickupOrderIds = pickupOrders.map(pickup => pickup.id);

                const orders = await prisma.order.findMany({
                    where: { pickupOrderId: { in: pickupOrderIds } },
                    select: { id: true }
                })

                const orderIds = orders.map(order => order.id)

                whereClause.orderId = { in: orderIds }
            }
        }

        const now = new Date();
        const month = filterMonth ? Number(filterMonth) - 1 : now.getMonth();
        const year = filterYear ? Number(filterYear) : now.getFullYear();
    
        function getDaysInSpecificMonth(year: number, month: number): number {
            const date = new Date(year, month);
            return getDaysInMonth(date);
        }
        const daysInMonth = getDaysInSpecificMonth(year, month)        

        const incomeDaily: number[] = [];
        const transactionDaily: number[] = [];
        const weightDaily: number[] = [];


        const fetchDailyData = async () => {
            for (let i = 1; i <= daysInMonth; i++) {
                const day = new Date(year, month, i);
                const startOfDay = new Date(day.setHours(0, 0, 0, 0));
                const endOfDay = new Date(day.setHours(23, 59, 59, 999));

                const dailyWhereClause = {
                    ...whereClause,
                    updatedAt: {
                        gte: startOfDay,
                        lt: endOfDay,
                    },
                }
                const dailyPayments = await prisma.payment.findMany({
                    where: dailyWhereClause,
                    include: { order: true }
                });

                let totalIncome = 0;
                let totalTransaction = 0;
                let totalWeight = 0;

                dailyPayments.forEach((payment) => {
                    totalIncome += payment.amount;
                    totalTransaction += 1;
                    totalWeight += payment.order?.weight ?? 0;
                });
                incomeDaily.push(Number(totalIncome));
                transactionDaily.push(Number(totalTransaction));
                weightDaily.push(Number(totalWeight));
            }
        }

        await fetchDailyData();

        const incomeMonthly: number[] = [];
        const transactionMonthly: number[] = [];
        const weightMonthly: number[] = [];
        const monthTypes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        const fetchMonthlyData = async () => {
            for (const monthType of monthTypes) {
                const startDate = new Date(year, monthType - 1, 1);
                const endDate = endOfMonth(startDate);

                const monthlyWhereClause = {
                    ...whereClause,
                    updatedAt: {
                        gte: startDate,
                        lt: endDate,
                    },
                };

                const monthlyPayments = await prisma.payment.findMany({
                    where: monthlyWhereClause,
                    include: { order: true }
                });

                let totalIncome = 0;
                let totalTransaction = 0;
                let totalWeight = 0;

                monthlyPayments.forEach((payment) => {
                    totalIncome += payment.amount;
                    totalTransaction += 1;
                    totalWeight += payment.order?.weight ?? 0;
                });

                incomeMonthly.push(Number(totalIncome));
                transactionMonthly.push(Number(totalTransaction));
                weightMonthly.push(Number(totalWeight));
            }
        };

        await fetchMonthlyData();

        const startDate = new Date(year, month, 1);
        const endDate = endOfMonth(startDate);

        whereClause.updatedAt = {
            gte: startDate,
            lt: endDate,
        };

        const payments = await prisma.payment.findMany({
            where: whereClause,
            include: { order: true }
        });

        let totalIncome = 0
        let totalTransaction = 0
        let totalWeight = 0

        payments.forEach((payment) => {
            totalIncome += payment.amount;
            totalTransaction += 1;
            totalWeight += payment.order?.weight ?? 0;
        });

        return {
            data: {
                totalIncome: totalIncome,
                totalTransaction: totalTransaction,
                totalWeight: totalWeight,
                incomeMonthly: incomeMonthly,
                transactionMonthly: transactionMonthly,
                weightMonthly: weightMonthly,
                incomeDaily: incomeDaily,
                transactionDaily: transactionDaily,
                weightDaily: weightDaily,
            }
        };
    } catch (error) {
        throw error
    }
}