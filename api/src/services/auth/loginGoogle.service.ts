import { OAuth2Client } from "google-auth-library";
import prisma from "../../prisma";
import { sign } from "jsonwebtoken";
import { appConfig } from "../../utils/config";

const oAuth2Client = new OAuth2Client(process.env.CLIENT_ID);

interface LoginGoogleArgs {
  email: string;
  name: string;
  picture: string;
}

export const loginGoogleService = async (idToken: string) => {
  try {
    // Verifikasi ID Token langsung
    const ticket = await oAuth2Client.verifyIdToken({
      idToken,
      audience: process.env.CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error("Invalid token payload");
    }

    const userData: LoginGoogleArgs = {
      email: payload.email,
      name: payload.name || "",
      picture: payload.picture || "",
    };

    // Cek apakah user sudah ada di database
    const existingUser = await prisma.user.findFirst({
      where: { email: userData.email },
    });

    if (
      existingUser &&
      existingUser.avatar?.includes("googleusercontent.com")
    ) {
      const token = sign({ id: existingUser.id }, appConfig.jwtSecretKey, {
        expiresIn: "2h",
      });

      return {
        message: "Login by Google Success",
        data: existingUser,
        token,
      };
    }

    if (existingUser?.password) {
      throw new Error("Please login using email and password");
    }

    // Buat user baru jika belum ada
    const newUser = await prisma.user.create({
      data: {
        email: userData.email,
        fullName: userData.name,
        avatar: userData.picture,
        isVerify: true,
      },
    });

    const token = sign({ id: newUser.id }, appConfig.jwtSecretKey, {
      expiresIn: "2h",
    });

    return {
      message: "Login by Google Success ✅",
      data: newUser,
      token,
    };
  } catch (error) {
    console.error("Google Login Error:", error);
    throw new Error("Google login failed. Please try again.");
  }
};
