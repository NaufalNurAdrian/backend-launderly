import prisma from "../../prisma";

interface FormUpdateAddressArgs {
  addressLine: string;
  city: string;
  latitude: string;
  longitude: string;
  isPrimary: boolean;
}

export const createUserAddressService = async (
  id: number,
  body: FormUpdateAddressArgs,
) => {
  try {
    const { addressLine } = body;

    const existingAddress = await prisma.address.findFirst({
      where: { addressLine: { equals: addressLine } },
    });

    if (existingAddress) {
      throw new Error('Address already exist !');
    }

    const createUserAddress = await prisma.address.create({
      data: {
        addressLine: body.addressLine,
        city: body.city,
        isPrimary: body.isPrimary,
        latitude: body.latitude,
        longitude: body.longitude,
        userId: id,
      },
    });

    return { message: 'Create address success', data: createUserAddress };
  } catch (error) {
    throw error;
  }
};