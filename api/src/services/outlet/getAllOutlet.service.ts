import prisma from "../../prisma";

export const getAllOutletService = async (page: number, limit: number) => {
  try {
    const skip = (page - 1) * limit; // Hitung offset
    const outlets = await prisma.outlet.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        outletName: true,
        outletType: true,
        address: true,
        isDelete: true
      },
    });

    const totalCount = await prisma.outlet.count(); // Hitung total data

    return { outlets, totalCount };
  } catch (error: any) {
    throw new Error(error.message);
  }
};
