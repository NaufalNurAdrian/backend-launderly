import { Request, Response } from "express";
import prisma from "../../prisma";
import crypto from "crypto";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import { transporter } from "../../libs/nodemailer";

export const requestForgetPasswordService = async (req: Request, res: Response) => {
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

    // Buat token unik
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // Simpan token di database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: new Date(Date.now() + 3600000), // Token berlaku 1 jam
      },
    });

    // Buat link reset password
    const resetLink = `${process.env.BASE_URL_FE}/reset-password/${resetToken}`;

    // Baca template email
    const templatePath = path.join(__dirname, "../templates", "resetPassword.hbs");
    const templateSource = fs.readFileSync(templatePath, "utf-8");
    const compiledTemplate = Handlebars.compile(templateSource);
    const html = compiledTemplate({ name: user.fullName, resetLink });

    // Kirim email dengan template
    await transporter.sendMail({
      from: `"Admin" <${process.env.GMAIL_EMAIL}>`,
      to: email,
      subject: "Reset Your Password",
      html,
    });

    return res.status(200).json({ message: "If the email exists, a reset link will be sent." });

  } catch (error) {
    console.error("Error requesting reset password:", error);
    return res.status(500).json({ message: "An internal server error occurred!" });
  }
};
