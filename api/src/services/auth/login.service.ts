import { Request, Response } from "express";
import prisma from "../../prisma";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";

export const loginService = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Request Body:", req.body);

    // Validasi input
    if (!req.body || !req.body.email || !req.body.password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const { email, password } = req.body;

    // Cari user berdasarkan email
    const customer = await prisma.user.findFirst({
      where: { email },
    });

    // Jika user tidak ditemukan
    if (!customer) {
      throw new Error("Customer account not found!");
    }

    // Jika user terdaftar dengan Google (tanpa password)
    if (!customer.password) {
      throw new Error("This email is registered via Google. Please log in using Google.");
    }

    // Validasi password
    const isValidPass = await bcrypt.compare(password, customer.password);
    if (!isValidPass) {
      throw new Error("Incorrect Password!");
    }

    // Jika akun belum diverifikasi
    if (!customer.isVerify) {
      throw new Error("Your account is not verified. Please verify your account before logging in.");
    }

    // Buat token JWT untuk user
    const payload = {
      id: customer.id,
      role: customer.role,
      authProvider: "email",
    };
    const token = sign(payload, process.env.JWT_KEY!, { expiresIn: "1d" });

    console.log("Generated Token:", token);

    res.status(200).json({ message: "Login Successfully", customer, token });
  } catch (err: unknown) {
    console.error("Error during login:", err);

    // Tangani error dengan aman di TypeScript
    if (err instanceof Error) {
      res.status(400).json({ message: err.message });
    } else {
      res.status(400).json({ message: "Something went wrong" });
    }
  }
};
