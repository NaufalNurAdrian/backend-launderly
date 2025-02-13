
import bcrypt from "bcrypt";
import prisma from "../../prisma";

export interface AddEmployeeInput {
  fullName: string;
  email: string;
  password: string;
  outletId: number;
  role: "OUTLET_ADMIN" | "WORKER" | "DRIVER";
  workShift?: "DAY" | "NIGHT";
  station?: "WASHING" | "IRONING" | "PACKING";
}

export const addEmployeeService = async (data: AddEmployeeInput) => {
  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { fullName: data.fullName }],
      },
    });

    if (existingUser) {
      throw new Error("Email or fullName already exists");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        password: hashedPassword,
        role: data.role,
      },
    });

    const employee = await prisma.employee.create({
      data: {
        userId: user.id,
        outletId: data.outletId,
        // workShift: data.workShift,
        station: data.station,
      },
    });
    return { user, employee };
  } catch (error: any) {
    throw new Error(error.message || "Failed to add employee");
  }
};
