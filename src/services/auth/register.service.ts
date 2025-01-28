import prisma from "@/prisma";
import { User } from "@prisma/client";
import path from "path";
import fs from "fs";
import Handlebars from "handlebars";
import { transporter } from "@/libs/nodemailer";

export const registerService = async (body: Pick<User, "email">) => {
  try {
    const NEXT_BASE_URL = process.env.NEXT_BASE_URL;
    const { email } = body;
    const existingEmail = await prisma.user.findFirst({
      where: { email: email },
    });

    if (existingEmail && existingEmail.isDelete === true) {
      throw new Error(
        "This account was removed. Please use another email or reach out to support."
      );
    }

    if (existingEmail) {
      throw new Error("Email already exist");
    }

    const setProfileLink =
      NEXT_BASE_URL + `/register/complete-registration?email=${email}`;

    const templatePath = path.join(
      __dirname,
      "../../../templates/completeRegist.html"
    );
    const templateSource = fs.readFileSync(templatePath, "utf-8");
    const compileTemplate = Handlebars.compile(templateSource);
    await transporter.sendMail({
      from: "Admin",
      to: email,
      subject: "Complete your registration",
      html: compileTemplate({ link: setProfileLink }),
    });

    return {
      message: `Registration email has been sent to ${email}`,
    };
  } catch (error) {
    throw error;
  }
};
