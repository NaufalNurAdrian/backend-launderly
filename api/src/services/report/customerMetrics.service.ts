import prisma from "../../prisma";

export async function getCustomerMetrics(baseWhereClause: any) {
  try {
    const activeCustomers = await prisma.user.findMany({
      where: {
        role: "CUSTOMER",
        isDelete: false,
        pickupOrder: {
          some: {
            createdAt: baseWhereClause.createdAt,
            outletId: baseWhereClause.outletId,
          },
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            pickupOrder: {
              where: {
                createdAt: baseWhereClause.createdAt,
                outletId: baseWhereClause.outletId,
              },
            },
          },
        },
      },
    });

    const newCustomers = activeCustomers.filter(customer =>
      customer.createdAt >= baseWhereClause.createdAt.gte
    ).length;
    const returningCustomers = activeCustomers.length - newCustomers;

    const topCustomers = activeCustomers
      .sort((a, b) => b._count.pickupOrder - a._count.pickupOrder)
      .slice(0, 5)
      .map(customer => ({
        id: customer.id,
        name: customer.fullName,
        email: customer.email,
        orderCount: customer._count.pickupOrder,
        isNew: customer.createdAt >= baseWhereClause.createdAt.gte,
      }));

    return {
      active: activeCustomers.length,
      new: newCustomers,
      returning: returningCustomers,
      topCustomers
    };
  } catch (error: any) {
    console.error("Error in getCustomerMetrics:", error);
    throw new Error(`Error getting customer metrics: ${error.message}`);
  }
}
