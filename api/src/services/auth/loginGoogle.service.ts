import prisma from '@/prisma';
import { appConfig } from '@/utils/config';
import { OAuth2Client } from 'google-auth-library';
import { sign } from 'jsonwebtoken';

const oAuth2Client = new OAuth2Client(process.env.CLIENT_ID);

interface GooglePayload {
  email: string;
  name: string;
  picture: string;
}

export const getGoogleTokenService = async (code: string) => {
  try {
    if (!code) {
      throw new Error("Authorization code is required");
    }

    // Verifikasi token dengan Google
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: code,
      audience: process.env.CLIENT_ID,
    });

    const payload = ticket.getPayload() as GooglePayload;

    if (!payload?.email) {
      throw new Error("Invalid Google token");
    }

    // Cek apakah user sudah terdaftar
    let user = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (user && user.password) {
      throw new Error("Please login using email and password");
    }

    if (!user) {
      // Buat user baru jika belum ada
      user = await prisma.user.create({
        data: {
          email: payload.email,
          fullName: payload.name,
          avatar: payload.picture,
          isVerify: true,
        },
      });
    }

    // Generate JWT token
    const token = sign({ id: user.id }, appConfig.jwtSecretKey, {
      expiresIn: "2h",
    });

    return {
      message: "Login with Google successful!",
      data: user,
      token,
    };
  } catch (error) {
    console.error("Google login error:", error);
    throw new Error("Failed to authenticate with Google");
  }
};
