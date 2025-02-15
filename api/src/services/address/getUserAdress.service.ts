import prisma from "../../prisma";

export const getUserAddressService = async (id: number) => {
  try {
    const address = await prisma.address.findMany({
      where: { userId:id, isDelete: false },
    });

    if (!address) {
      throw new Error('Address not found !');
    }

    return address;
  } catch (error) {
    throw error;
  }
};