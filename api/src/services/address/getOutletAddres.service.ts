import prisma from "../../prisma";

// Service untuk mendapatkan outlet
export const getAllOutletsService = async () => {
  try {
    // Ambil semua outlet yang belum dihapus dari database
    const outlets = await prisma.outlet.findMany({
      where: { isDelete: false },
      include: {
        address: {
          where: { isDelete: false },
          select: { latitude: true, longitude: true },
        },
      },
    });

    return outlets;
  } catch (error) {
    console.error("Error retrieving outlets:", error);
    throw new Error("Failed to retrieve outlets");
  }
};
