import { Request, Response } from "express";
import prisma from "../../prisma";
import { sign } from "jsonwebtoken";
import path from "path";
import fs from "fs";
import Handlebars from "handlebars";
import { transporter } from "../../libs/nodemailer";
import validator from "validator";

export const updateEmailService = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { newEmail } = req.body;

    if (!newEmail || !validator.isEmail(newEmail)) {
      return res.status(400).json({ message: "Invalid email format!" });
    }

    // Cek apakah user ada dan sudah diverifikasi sebelumnya
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (!user.isVerify) {
      return res.status(403).json({ message: "Please verify your current email first!" });
    }

    // Cek apakah email sudah dipakai oleh user lain
    const existingUser = await prisma.user.findUnique({ where: { email: newEmail } });

    if (existingUser) {
      return res.status(400).json({ message: "Email already in use!" });
    }

    // Generate verification token
    const payload = { id: userId, newEmail };
    const token = sign(payload, process.env.JWT_KEY!, { expiresIn: "10m" });
    const link = `${process.env.BASE_URL_FE}/verify-email/${token}`;

    // Baca template email
    const templatePath = path.join(__dirname, "../templates", "verifyEmail.hbs");
    const templateSource = fs.readFileSync(templatePath, "utf-8");
    const compiledTemplate = Handlebars.compile(templateSource);
    const html = compiledTemplate({ link });

    // Kirim email verifikasi
    await transporter.sendMail({
      from: "Admin",
      to: newEmail,
      subject: "Verify Your New Email",
      html,
    });

    // Simpan token ke database (opsional)
    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerifyToken: token,
      },
    });

    res.status(200).json({
      message: "Verification email sent! Please check your inbox.",
    });
  } catch (error) {
    console.error("Error updating email:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
