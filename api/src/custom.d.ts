// src/custom.d.ts
import "express"; // Menambahkan ekstensi ke Express

export type Role = "SUPER_ADMIN" | "OUTLET_ADMIN" | "WORKER" | "DRIVER" | "CUSTOMER";

export type UserPayload = {
  id: number;
  role: Role;
};

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload; // Menambahkan `user` ke Request
    }
  }
}
