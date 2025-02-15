import { Request, Response } from "express";
import prisma from "../../prisma";

export const createUserAddressService = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { addressLine, city, isPrimary, latitude, longitude } = req.body;

    if (!addressLine || !city) {
      return res.status(400).json({ message: "Address line and city are required" });
    }

    if (isPrimary) {
      await prisma.address.updateMany({
        where: { userId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    // Buat alamat baru
    const newAddress = await prisma.address.create({
      data: {
        addressLine,
        city,
        isPrimary: isPrimary || false,
        latitude,
        longitude,
        userId,
      },
    });

    return res.status(201).json({ message: "Address created successfully", address: newAddress });
  } catch (error) {
    console.error("Error creating address:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};
