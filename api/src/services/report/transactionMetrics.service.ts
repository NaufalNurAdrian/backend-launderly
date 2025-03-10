import prisma from "../../prisma";
import { ReportTimeframe } from "@/types/report";
import { format } from "date-fns";

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

    // Log date range for clarity
    if (otherWhereClause.createdAt) {
      console.log(`Fetching payments from ${format(otherWhereClause.createdAt.gte, 'yyyy-MM-dd HH:mm:ss')} to ${format(otherWhereClause.createdAt.lte, 'yyyy-MM-dd HH:mm:ss')}`);
    }

    // Find all payments within the specified date range
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

    console.log(`Found ${payments.length} payments in the specified date range`);

    // IMPORTANT: Use all payments in the date range, not just "current period"
    // This ensures consistency across all reports
    const filteredPayments = payments;
    
    // Calculate metrics based on all payments in the date range
    const successful = filteredPayments.filter(p => p.paymentStatus === 'SUCCESSED').length;
    const pending = filteredPayments.filter(p => p.paymentStatus === 'PENDING').length;
    const failed = filteredPayments.filter(p =>
      ['CANCELLED', 'DENIED', 'EXPIRED'].includes(p.paymentStatus as string)
    ).length;
    const total = filteredPayments.length;

    const conversionRate = total > 0 ? successful / total : 0;

    // Process payment methods
    const paymentMethodsMap = new Map();
    filteredPayments.forEach(payment => {
      const method = payment.paymentMethode || 'Unknown';
      if (!paymentMethodsMap.has(method)) {
        paymentMethodsMap.set(method, { method, count: 0, value: 0 });
      }
      const methodStat = paymentMethodsMap.get(method);
      methodStat.count += 1;
      methodStat.value += payment.amount;
    });
    const paymentMethods = Array.from(paymentMethodsMap.values());

    // Calculate transaction value statistics
    const successfulPayments = filteredPayments.filter(p => p.paymentStatus === 'SUCCESSED');
    const amounts = successfulPayments.map(p => p.amount);
    const averageValue = amounts.length > 0 
      ? amounts.reduce((sum, val) => sum + val, 0) / amounts.length 
      : 0;
    const highestValue = amounts.length > 0 ? Math.max(...amounts) : 0;
    const lowestValue = amounts.length > 0 ? Math.min(...amounts) : 0;

    // Log summary for debugging
    console.log(`Transaction metrics summary for ${timeframe}:`, {
      total,
      successful,
      pending,
      failed,
      avgValue: Math.round(averageValue)
    });

    return {
      count: {
        successful,
        pending,
        failed,
        total
      },
      conversionRate: parseFloat(conversionRate.toFixed(4)),
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