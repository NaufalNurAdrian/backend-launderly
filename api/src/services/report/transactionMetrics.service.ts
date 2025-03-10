import prisma from "../../prisma";
import { ReportTimeframe } from "@/types/report";
import { 
  startOfDay, endOfDay, 
  startOfWeek, endOfWeek, 
  startOfMonth, endOfMonth, 
  startOfYear, endOfYear,
  isWithinInterval 
} from "date-fns";

export async function getTransactionMetrics(baseWhereClause: any, timeframe: ReportTimeframe = "daily") {
  try {
    console.log(`Transaction metrics where clause (timeframe: ${timeframe}):`, JSON.stringify(baseWhereClause, null, 2));
    
    const { outletId, ...otherWhereClause } = baseWhereClause;

    const whereClause = {
      ...otherWhereClause,
      order: outletId ? {
        pickupOrder: {
          outletId: outletId
        }
      } : undefined
    };

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        order: {
          include: {
            pickupOrder: true
          }
        }
      }
    });

    // Determine current period based on timeframe for "right now" calculations
    const now = new Date();
    let currentPeriodStart: Date;
    let currentPeriodEnd: Date;
    
    switch (timeframe) {
      case "daily":
        currentPeriodStart = startOfDay(now);
        currentPeriodEnd = endOfDay(now);
        break;
      case "weekly":
        currentPeriodStart = startOfWeek(now, { weekStartsOn: 1 }); // Week starts on Monday
        currentPeriodEnd = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case "monthly":
        currentPeriodStart = startOfMonth(now);
        currentPeriodEnd = endOfMonth(now);
        break;
      case "yearly":
        currentPeriodStart = startOfYear(now);
        currentPeriodEnd = endOfYear(now);
        break;
      default:
        currentPeriodStart = startOfDay(now);
        currentPeriodEnd = endOfDay(now);
    }
    
    // Filter payments for current period (if timeframe is not custom)
    const currentPeriodPayments = timeframe !== "custom" 
      ? payments.filter(payment => {
          const paymentDate = new Date(payment.createdAt);
          return isWithinInterval(paymentDate, {
            start: currentPeriodStart,
            end: currentPeriodEnd
          });
        })
      : payments;
    
    console.log(`Current period (${timeframe}) has ${currentPeriodPayments.length} payments`);

    const successful = currentPeriodPayments.filter(p => p.paymentStatus === 'SUCCESSED').length;
    const pending = currentPeriodPayments.filter(p => p.paymentStatus === 'PENDING').length;
    const failed = currentPeriodPayments.filter(p =>
      ['CANCELLED', 'DENIED', 'EXPIRED'].includes(p.paymentStatus as string)
    ).length;
    const total = currentPeriodPayments.length;

    const conversionRate = total > 0 ? (successful / total) * 100 : 0;

    const paymentMethodsMap = new Map();
    currentPeriodPayments.forEach(payment => {
      const method = payment.paymentMethode || 'Unknown';
      if (!paymentMethodsMap.has(method)) {
        paymentMethodsMap.set(method, { method, count: 0, value: 0 });
      }
      const methodStat = paymentMethodsMap.get(method);
      methodStat.count += 1;
      methodStat.value += payment.amount;
    });
    const paymentMethods = Array.from(paymentMethodsMap.values());

    const successfulPayments = currentPeriodPayments.filter(p => p.paymentStatus === 'SUCCESSED');
    const amounts = successfulPayments.map(p => p.amount);
    const averageValue = amounts.length > 0 
      ? amounts.reduce((sum, val) => sum + val, 0) / amounts.length 
      : 0;
    const highestValue = amounts.length > 0 ? Math.max(...amounts) : 0;
    const lowestValue = amounts.length > 0 ? Math.min(...amounts) : 0;

    return {
      count: {
        successful,
        pending,
        failed,
        total
      },
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      paymentMethods,
      averageValue: Math.round(averageValue),
      highestValue,
      lowestValue
    };
  } catch (error: any) {
    console.error("Error in getTransactionMetrics:", error);
    throw new Error(`Error getting transaction metrics: ${error.message}`);
  }
}