
import bcrypt from "bcrypt";
import prisma from "../../prisma";
import { transporter } from "../../libs/nodemailer";
import { sign } from "jsonwebtoken";
import path from "path";
import fs from "fs";
import Handlebars from "handlebars";
import { Request, Response } from "express";

export interface AddEmployeeInput {
  fullName: string;
  email: string;
  password: string;
  outletId: number;
  role: "OUTLET_ADMIN" | "WORKER" | "DRIVER";
  workShift?: "DAY" | "NIGHT";
  station?: "WASHING" | "IRONING" | "PACKING";
}

export const addEmployeeService = async (data: AddEmployeeInput, req: Request) => {
  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { fullName: data.fullName }],
      },
    });

    if (existingUser) {
      throw new Error("Email or fullName already exists");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        password: hashedPassword,
        role: data.role,
      },
    });

    const employee = await prisma.employee.create({
      data: {
        userId: user.id,
        outletId: Number(data.outletId),
        workShift: data.workShift,
        station: data.station,
      },
    });

    const payload = { id: employee.id, role: "customer" };
    const token = sign(payload, process.env.JWT_KEY!, { expiresIn: "60m" });
    const link = `${process.env.BASE_URL_FE}/verify/${token}`;

    const templatePath = path.join(__dirname, "../templates", "verify.hbs");
    const templateSource = fs.readFileSync(templatePath, "utf-8");
    const compiledTemplate = Handlebars.compile(templateSource);
    const html = compiledTemplate({ username: req.body.username, link });

    await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to: req.body.email,
      subject: "Registration Successful",
      html,
    });

    return { user, employee };
  } catch (error: any) {
    throw new Error(error.message || "Failed to add employee");
  }
};

