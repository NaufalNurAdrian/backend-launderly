import { Request, Response } from "express";
import { verify } from "jsonwebtoken";
import prisma from "../../prisma";

export const verifyService = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const verifiedCustomer = verify(token, process.env.JWT_KEY!) as {
      id: number;
      role: string;
    };
    await prisma.user.update({
      data: { isVerify: true },
      where: { id: verifiedCustomer.id },
    });
    res.status(200).send({ message: "Customer verified successfully" });
  } catch (err: any) {
    console.error("Error verifying customer:", err);
    res.status(400).send({
      message: "Invalid token or verification failed",
      error: err.message,
    });
  }
};
