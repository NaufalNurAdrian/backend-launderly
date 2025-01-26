import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { UserPayload } from "../custom";

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    console.log(token);
    
    if (!token) throw { message: "Unauthorize!" };
    
    const verifiedUser = verify(token, process.env.JWT_KEY!);
    console.log(verifiedUser);

    req.user = verifiedUser as UserPayload;

    next();
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};