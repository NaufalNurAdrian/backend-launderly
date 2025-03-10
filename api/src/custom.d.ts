import "express";

export type Role = "SUPER_ADMIN" | "OUTLET_ADMIN" | "WORKER" | "DRIVER" | "CUSTOMER";

export type UserPayload = {
  id: number;
  role: Role;
};

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload; 
    }
  }
}