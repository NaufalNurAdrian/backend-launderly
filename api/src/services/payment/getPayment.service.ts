import prisma from '@/prisma';

interface GetPaymentQuery {
  id: number;
  orderId: number;
}

export const getPaymentService = async (query: GetPaymentQuery) => {
  try {
    const { orderId, id } = query;

    const payment = await prisma.payment.findFirst({
      where: !isNaN(id) ? { id } : { orderId },
      orderBy: !isNaN(orderId) ? { invoiceNumber: 'desc' } : undefined,
      include: {
        order: { include: { pickupOrder: { include: { user: true } } } },
      },
    });

    if (!payment) {
      throw new Error('Transaction not found');
    }

    return payment;
  } catch (error) {
    throw error;
  }
};