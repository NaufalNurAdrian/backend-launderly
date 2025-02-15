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
    const { addressLine, latitude, longitude } = body;

    const existingAddress = await prisma.address.findFirst({
      where: { addressLine: { equals: addressLine } },
    });

    if (existingAddress) {
      throw new Error('Address already exists!');
    }

    // Konversi latitude dan longitude ke number
    const latitudeNumber = parseFloat(latitude);
    const longitudeNumber = parseFloat(longitude);

    if (isNaN(latitudeNumber) || isNaN(longitudeNumber)) {
      throw new Error('Invalid latitude or longitude!');
    }

    const createUserAddress = await prisma.address.create({
      data: {
        addressLine: body.addressLine,
        city: body.city,
        isPrimary: body.isPrimary,
        latitude: latitudeNumber,
        longitude: longitudeNumber,
        userId: id,
      },
    });

    return { message: 'Create address success', data: createUserAddress };
  } catch (error) {
    throw error;
  }
};
