import { Address } from "@prisma/client";
import prisma from "../../prisma";

interface UpdateOutletInput {
  id: number;
  outletName?: string;
  outletType?: "MAIN" | "BRANCH";
  address?: Address[];
}

export const updateOutletService = async (body: UpdateOutletInput) => {
  try {
    const { id, outletName, outletType, address } = body;

    const existingOutlet = await prisma.outlet.findUnique({
      where: { id },
    });

    if (!existingOutlet) {
      throw new Error("Outlet not found");
    }

    if (outletName) {
      const existingName = await prisma.outlet.findFirst({
        where: {
          outletName,
          id: { not: id },
        },
      });
      if (existingName) {
        throw new Error("Outlet name already exists");
      }
    }

    if (outletType) {
      const existingType = await prisma.outlet.findFirst({
        where: {
          outletType,
          id ,
        },
      });
      if (existingType) {
        throw new Error("Outlet type already exists");
      }
    }

    if (address && address.length > 0) {
      for (const addr of address) {
        const existingAddress = await prisma.address.findFirst({
          where: {
            addressLine: addr.addressLine,
            city: addr.city,
            isDelete: false,
          },
        });

        if (existingAddress) {
          throw new Error(`Address ${addr.addressLine}, ${addr.city} already exists`);
        }
      }
    }

    const updatedOutlet = await prisma.outlet.update({
      where: { id },
      data: {
        ...(outletName && { outletName }),
        ...(outletType && { outletType }),
        ...(address && { address: { set: address } }),
      },
    });

    return updatedOutlet;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
