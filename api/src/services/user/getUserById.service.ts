import prisma from "../../prisma";
import { Request, Response } from "express";

export const getUsersIdService = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).send({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }, 
    });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    res.status(200).send({ user });
  } catch (err) {
    console.log(err);
    res.status(400).send({ message: "An error occurred" });
  }
};

