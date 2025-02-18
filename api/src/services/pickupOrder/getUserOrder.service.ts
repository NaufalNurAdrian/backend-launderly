import prisma from "../../prisma";

export const getUserOrdersService = async (userId: number) => {
  try {
    // Mencari semua Order di mana pickupOrder.userId = userId
    const orders = await prisma.order.findMany({
      where: {
        pickupOrder: {
          userId: userId,
        },
      },
      include: {
        pickupOrder: {
          include: {
            address: true,
            outlet: true,
            user: true,
            driver: {
              include: {
                user: true,
              },
            },
          },
        },
        // Jika kamu butuh data lain dari Order, misalnya orderItem, payment, dll.
        orderItem: true,
        deliveryOrder: true,
        payment: true,
      },
    });

    return orders;
  } catch (error) {
    throw error;
  }
};
