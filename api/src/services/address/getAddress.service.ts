import { Request, Response } from "express";
import prisma from "../../prisma";

export const getAddress = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  try {
    const addresses = await prisma.address.findMany({
      where: { userId, isDelete: false },
      orderBy: { isPrimary: "desc" },
    });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve addresses" });
  }
};
