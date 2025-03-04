import prisma from "../../prisma";

export const getOutletByIdService = async (id: string) => {
  try {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new Error("Invalid outlet ID");
    }

    const result = await prisma.outlet.findUnique({
      where: { id: numericId },
      select: {
        id: true,
        outletName: true,
        outletType: true,
        address: {
          where: { isDelete: false },
          select: { id: true, addressLine: true, city: true },
        },
      },
    });

    if (!result) {
      throw new Error("Outlet not found");
    }

    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
