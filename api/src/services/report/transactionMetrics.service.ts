import prisma from "../../prisma";

export async function getTransactionMetrics(baseWhereClause: any) {
  try {
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

    const successful = payments.filter(p => p.paymentStatus === 'SUCCESSED').length;
    const pending = payments.filter(p => p.paymentStatus === 'PENDING').length;
    const failed = payments.filter(p =>
      ['CANCELLED', 'DENIED', 'EXPIRED'].includes(p.paymentStatus as string)
    ).length;
    const total = payments.length;

    const conversionRate = total > 0 ? (successful / total) * 100 : 0;

    const paymentMethodsMap = new Map();
    payments.forEach(payment => {
      const method = payment.paymentMethode || 'Unknown';
      if (!paymentMethodsMap.has(method)) {
        paymentMethodsMap.set(method, { method, count: 0, value: 0 });
      }
      const methodStat = paymentMethodsMap.get(method);
      methodStat.count += 1;
      methodStat.value += payment.amount;
    });
    const paymentMethods = Array.from(paymentMethodsMap.values());

    const successfulPayments = payments.filter(p => p.paymentStatus === 'SUCCESSED');
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