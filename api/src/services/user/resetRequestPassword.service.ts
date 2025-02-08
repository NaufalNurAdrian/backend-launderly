import { Request, Response } from "express";
import prisma from "../../prisma";
import crypto from "crypto";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

export const requestResetPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required!" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Jangan beri tahu jika email tidak ditemukan
    if (!user || !user.password) {
      return res.status(200).json({ message: "If the email exists, a reset link will be sent." });
    }

    // Hapus token lama sebelum menyimpan yang baru
    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: null, resetPasswordExpires: null },
    });

    // Buat token unik & hash sebelum disimpan
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(resetToken, 10);

    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: new Date(Date.now() + 3600000), // Token berlaku 1 jam
      },
    });

    // Kirim email reset password
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `${process.env.BASE_URL_FE}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: "admin",
      to: email,
      subject: "Reset Password Request",
      text: `Click the following link to reset your password: ${resetLink}`,
    });

    return res.status(200).json({ message: "If the email exists, a reset link will be sent." });

  } catch (error) {
    console.error("Error requesting reset password:", error);
    return res.status(500).json({ message: "An internal server error occurred!" });
  }
};
