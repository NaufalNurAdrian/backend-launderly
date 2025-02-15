import prisma from '@/prisma';
import { Address } from '@prisma/client';

interface FormUpdateAddressArgs {
  addressLine: string;
  city: string;
  latitude: string;
  longitude: string;
  isPrimary: boolean;
}

export const updateUserAddressService = async (
  id: number,
  body: Partial<FormUpdateAddressArgs>,
) => {
  try {
    const { addressLine, city, isPrimary, latitude, longitude } = body;

    const address = await prisma.address.findFirst({
      where: { id: id },
    });

    if (!address) {
      throw new Error('Address not found !');
    }
    if (address.isDelete === true) {
      throw new Error('Address not found !');
    }

    if (addressLine) {
      const existingAddress = await prisma.address.findFirst({
        where: { addressLine: { equals: addressLine } },
      });

      if (existingAddress) {
        throw new Error('Address already exist !');
      }
    }

    const update = await prisma.$transaction(async (tx) => {
      if (isPrimary === true) {
        await tx.address.updateMany({
          data: {
            isPrimary: false,
          },
        });
      }
      const updateAddress = await tx.address.update({
        where: { id: address.id },
        data: {
          addressLine: body.addressLine,
          city: body.city,
          isPrimary: body.isPrimary,
          latitude: body.latitude,
          longitude: body.longitude,
        },
      });
      return updateAddress;
    });

    return { message: 'Updates address success', data: update };
  } catch (error) {
    throw error;
  }
};