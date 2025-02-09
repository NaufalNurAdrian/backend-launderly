import { Request, Response } from "express";
import prisma from "../../prisma";
import bcrypt from "bcrypt";

export const confirmForgetPasswordService = async (req: Request, res: Response) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match!" });
    }

    // Cari user dengan token valid
    const users = await prisma.user.findMany({
      where: {
        resetPasswordExpires: { gte: new Date() }, 
      },
    });

    let user = null;
    for (const u of users) {
      if (await bcrypt.compare(token, u.resetPasswordToken!)) {
        user = u;
        break;
      }
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token!" });
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password dalam transaksi agar aman
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      }),
    ]);

    return res.status(200).json({ message: "Password has been reset successfully!" });

  } catch (error) {
    console.error("Error confirming reset password:", error);
    return res.status(500).json({ message: "An internal server error occurred!" });
  }
};
