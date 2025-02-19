import { NextFunction, Request, Response } from "express";
import { findCust } from "../../libs/register.service";
import bcrypt from "bcrypt";
import prisma from "../../prisma";
import { sign } from "jsonwebtoken";
import path from "path";
import fs from "fs";
import { transporter } from "../../libs/nodemailer";
import Handlebars from "handlebars";

export const registerService = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { fullName, email, password } = req.body;

    // Validate input
    if (!fullName || !email || !password) {
      res.status(400).send({ message: "All fields are required" });
      return;
    }

    // Check if customer already exists
    const existingCustomer = await findCust(email);
    if (existingCustomer) {
      res.status(400).send({ message: "Email already exists" });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new customer
    const customer = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
      },
    });

    // Generate verification token
    const payload = { id: customer.id, role: "customer" };
    const token = sign(payload, process.env.JWT_KEY!, { expiresIn: "60m" });
    const link = `${process.env.BASE_URL_FE}/verify/${token}`;

    // Prepare and send the email
    const templatePath = path.join(__dirname, "../templates", "verify.hbs");
    const templateSource = fs.readFileSync(templatePath, "utf-8");
    const compiledTemplate = Handlebars.compile(templateSource);
    const html = compiledTemplate({ username: req.body.username, link });

    await transporter.sendMail({
      from: "Admin",
      to: req.body.email,
      subject: "Registration Successful",
      html,
    });

    res.status(201).send({
      message:
        "Customer created successfully. Please check your email for verification.",
      customer,
    });
  } catch (err) {
    console.error("Error during registration:", err);
    res
      .status(500)
      .send({ message: "An error occurred during registration", error: err });
  }
};
