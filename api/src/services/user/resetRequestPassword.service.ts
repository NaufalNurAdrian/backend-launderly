import { Request, Response } from "express";
import prisma from "../../prisma";
import crypto from "crypto";
import nodemailer from "nodemailer";

export const requestResetPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required!" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (!user.password) {
      return res
        .status(400)
        .json({ message: "Cannot reset password for social login users!" });
    }

    // Buat token unik untuk reset password
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Simpan token ke database dengan expiry 1 jam
    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: new Date(Date.now() + 3600000), // Token berlaku 1 jam
      },
    });

    // Kirim email dengan link reset password (gunakan nodemailer atau layanan email lainnya)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `${process.env.BASE_URL_FE}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from:"admin",
      to: email,
      subject: "Reset Password Request",
      text: `Click the following link to reset your password: ${resetLink}`,
    });

    res.status(200).json({ message: "Reset password email has been sent!" });
  } catch (error) {
    console.error("Error requesting reset password:", error);
    res.status(500).json({ message: "An internal server error occurred!" });
  }
};
