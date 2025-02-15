import { Request } from "express";
import prisma from "../../prisma";

export const getUserAddressesService = async (req: Request) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const addresses = await prisma.address.findMany({
      where: { userId, isDelete: false },
      orderBy: { isPrimary: "desc" },
    });

    return { message: "Addresses retrieved successfully", addresses };
  } catch (error) {
    console.error("Error retrieving addresses:", error);
    throw new Error("Failed to retrieve addresses");
  }
};
