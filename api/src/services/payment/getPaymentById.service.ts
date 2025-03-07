import prisma from "../../prisma"; // Sesuaikan dengan path Prisma Anda

export const getUserPaymentsService = async (userId: number) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const payments = await prisma.payment.findMany({
    where: {
      order: {
        pickupOrder: {
          userId: userId,
        },
      },
    },
    select: {
      id: true,
      invoiceNumber: true,
      amount: true,
      paymentMethode: true,
      paymentStatus: true,
      snapRedirectUrl: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return payments;
};
