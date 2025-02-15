import prisma from "../../prisma";

interface FormUpdateAddressArgs {
  addressLine: string;
  city: string;
  latitude: string;
  longitude: string;
  isPrimary: boolean;
}

export const updateUserAddressService = async (
  id: number,
  body: Partial<FormUpdateAddressArgs>
) => {
  try {
    const { addressLine, city, isPrimary, latitude, longitude } = body;

    const address = await prisma.address.findFirst({
      where: { id: id },
    });

    if (!address || address.isDelete === true) {
      throw new Error("Address not found!");
    }

    if (addressLine) {
      const existingAddress = await prisma.address.findFirst({
        where: { addressLine: { equals: addressLine }, id: { not: id } },
      });

      if (existingAddress) {
        throw new Error("Address already exists!");
      }
    }

    const update = await prisma.$transaction(async (tx) => {
      if (isPrimary === true) {
        await tx.address.updateMany({
          where: { userId: address.userId }, // Pastikan hanya milik user yang sama
          data: { isPrimary: false },
        });
      }

      const updateAddress = await tx.address.update({
        where: { id: address.id },
        data: {
          addressLine,
          city,
          isPrimary,
          latitude: latitude !== undefined ? parseFloat(latitude) : undefined,
          longitude: longitude !== undefined ? parseFloat(longitude) : undefined,
        },
      });

      return updateAddress;
    });

    return { message: "Update address success", data: update };
  } catch (error) {
    throw error;
  }
};
