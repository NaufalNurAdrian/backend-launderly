import { Request, Response } from "express";
import prisma from "../../prisma";

export const verifyEmailService = async (req: Request, res: Response) => {
  try {
    const token = req.query.token;

    // Pastikan token adalah string
    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Invalid verification token!" });
    }

    // Cek apakah token valid
    const user = await prisma.user.findFirst({
      where: { emailVerifyToken: token },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token!" });
    }

    // Update status email menjadi verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerify: true,
        emailVerifyToken: null, 
      },
    });

    res.status(200).json({ message: "Email verified successfully!" });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
