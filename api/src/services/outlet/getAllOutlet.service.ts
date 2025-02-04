import prisma from "../../prisma";

export const getAllOutletService = async () => {
  try {
    const result = prisma.outlet.findMany({
      select: {
        id: true,
        outletName: true,
        outletType: true,
        address: true,
      },
    });
    return result;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
