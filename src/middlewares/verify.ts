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
    
    if (!token) throw { message: "Unauthorize!" };
    
    const verifiedUser = verify(token, process.env.JWT_KEY!);

    req.user = verifiedUser as UserPayload;

    next();
  } catch (error: any) {
    res.status(400).send(error.message);
  }
};

export const checkSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role == "SUPER_ADMIN") {
    next();
  } else {
    res.status(400).send({ message: "Unauthorize, Super Admin only!" });
  }
};

export const checkOutletAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role == "OUTLET_ADMIN") {
    next();
  } else {
    res.status(400).send({ message: "Unauthorize, Admin only!" });
  }
};

