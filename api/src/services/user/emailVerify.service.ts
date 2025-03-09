import { Request, Response } from "express";
import prisma from "../../prisma";
import { verify } from "jsonwebtoken";

export const verifyEmailService = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Verification token is required!" });
    }

    // Verifikasi token JWT
    let decoded;
    try {
      decoded = verify(token, process.env.JWT_KEY!) as { id: string; newEmail: string };
    } catch (error) {
      return res.status(400).json({ message: "Invalid or expired token!" });
    }

    const { id, newEmail } = decoded;

    // Konversi ID ke number
    const userId = Number(id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID!" });
    }

    // Cari user berdasarkan token yang dikirim di params
    const user = await prisma.user.findFirst({
      where: { emailVerifyToken: token },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token!" });
    }

    // Cek apakah email baru masih tersedia
    const existingUser = await prisma.user.findUnique({ where: { email: newEmail } });

    if (existingUser) {
      return res.status(400).json({ message: "Email already in use!" });
    }

    // Update email dan hapus token verifikasi
    await prisma.user.update({
      where: { id: userId },
      data: {
        email: newEmail,
        emailVerifyToken: null,
      },
    });

    res.status(200).json({ message: "Email verified and updated successfully!" });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ message: "An internal server error occurred!" });
  }
};
