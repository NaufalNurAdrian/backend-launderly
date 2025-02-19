import prisma from "../../prisma";
import { Request, Response } from "express";
import bcrypt from "bcrypt";

export const resetPasswordUserService = async (req: Request, res: Response) => {
  try {
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      res.status(400).send({ message: "All fields are required!" });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).send({ message: "Passwords do not match!" });
      return;
    }

    if (!req.user?.id) {
      res.status(401).send({ message: "Unauthorized request!" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      res.status(404).send({ message: "User not found!" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    res.status(200).send({ message: "Password has been reset successfully!" });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).send({ message: "An internal server error occurred!" });
  }
};
