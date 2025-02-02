import { Request, Response } from "express";
import prisma from "../../prisma";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";

export const loginService = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("Request Body:", req.body);

    // Validasi input
    if (!req.body || !req.body.email || !req.body.password) {
      res.status(400).send({ message: "Email and password are required" });
      return;
    }

    const { email, password } = req.body;

    const customer = await prisma.user.findFirst({
      where: { email },
    });

    if (!customer) throw { message: "Customer account not found!" };
    const isValidPass = await bcrypt.compare(password, customer.password!);
    if (!isValidPass) throw { message: "Incorrect Password!" };
    if (!customer.isVerify)
      throw {
        message:
          "Your account is not verified. Please verify your account before logging in.",
      };

    // Create JWT token for the customer
    const payload = {
      id: customer.id,
      role: customer.role,
    };
    const token = sign(payload, process.env.JWT_KEY!, { expiresIn: "1d" });

    console.log("Generated Token:", token);
    

    res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      })
      .send({ message: "Login Successfully", customer, token });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(400).send(err);
  }
};
