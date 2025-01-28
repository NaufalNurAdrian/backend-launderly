import prisma from "@/prisma";
import { User } from "@prisma/client";
import { sign } from "jsonwebtoken";
import path from "path";
import fs from "fs";
import Handlebars from "handlebars";
import { hashPassword } from "@/libs/hashPassword";
import { transporter } from "@/libs/nodemailer";
import { appConfig } from "@/utils/config";

interface CompleteRegistrationBody
  extends Pick<User, "email" | "password" | "fullName"> {}

export const completeRegistrationService = async (
  body: CompleteRegistrationBody
) => {
  try {
    const NEXT_BASE_URL = process.env.NEXT_BASE_URL;
    const { email, password, fullName } = body;

    const existingEmail = await prisma.user.findFirst({
      where: { email: email },
    });

    if (existingEmail) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email,
          fullName: fullName,
          password: hashedPassword,
        },
      });

      const token = sign({ id: user.id }, appConfig.jwtSecretKey, {
        expiresIn: "1h",
      });

      const expiresIn = new Date(Date.now() + 1 * 60 * 60 * 1000);
      await tx.user.update({
        where: { id: user.id },
        data: { token: token, tokenExpiresIn: expiresIn },
      });

      return { ...user, token: token };
    });

    const templatePath = path.join(__dirname, "../../../templates/verif.html");
    const templateSource = fs.readFileSync(templatePath, "utf-8");
    const compileTemplate = Handlebars.compile(templateSource);
    const confirmationLink = `${NEXT_BASE_URL}/register/verification?token=${newUser.token}`;

    await transporter.sendMail({
      from: "Admin",
      to: email,
      subject: "Verify your account",
      html: compileTemplate({
        name: newUser.fullName,
        link: confirmationLink,
      }),
    });

    return {
      message: `Verification email has been sent to ${email}`,
      data: newUser,
    };
  } catch (error) {
    throw error;
  }
};
