import { Address } from "../../../prisma/generated/client";
import prisma from "../../prisma";

interface UpdateOutletInput {
  id: string;
  outletName?: string;
  outletType?: "MAIN" | "BRANCH";
  address?: Address[];
}

export const updateOutletService = async (body: UpdateOutletInput) => {
  try {
    const { id, outletName, outletType, address } = body;

    const existingOutlet = await prisma.outlet.findUnique({
      where: { id: parseInt(id) },
      include: { address: true },
    });

    if (!existingOutlet) {
      throw new Error("Outlet not found");
    }

    const existingAddresses = Array.isArray(existingOutlet.address)
      ? existingOutlet.address
      : existingOutlet.address
      ? [existingOutlet.address]
      : [];

    const requestAddressIds = Array.isArray(address)
  ? address.map((addr) => addr.id).filter(Boolean)
  : [];

    await prisma.address.updateMany({
      where: {
        id: {
          in: existingAddresses.map((addr) => addr.id),
          notIn: requestAddressIds, 
        },
      },
      data: { isDelete: true },
    });

    const updatedAddresses = await Promise.all(
      Array.isArray(address)
        ? address.map(async (addr) => {
            if (addr.id) {
              return prisma.address.update({
                where: { id: addr.id },
                data: {
                  addressLine: addr.addressLine,
                  city: addr.city,
                  latitude: addr.latitude,
                  longitude: addr.longitude,
                  isDelete: false,
                },
              });
            } else {
              return prisma.address.create({
                data: {
                  addressLine: addr.addressLine,
                  city: addr.city,
                  latitude: addr.latitude,
                  longitude: addr.longitude,
                  isDelete: false,
                  outletId: parseInt(id),
                },
              });
            }
          })
        : [] 
    );

    const updatedOutlet = await prisma.outlet.update({
      where: { id: parseInt(id) },
      data: {
        ...(outletName && { outletName }),
        ...(outletType && { outletType }),
      },
      include: { address: true },
    });

    return {
      message: "Outlet updated successfully",
      result: updatedOutlet,
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
};
