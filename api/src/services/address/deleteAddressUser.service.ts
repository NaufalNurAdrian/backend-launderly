import prisma from "../../prisma";

export const deleteUserAddressService = async (id: number) => {
  try {
    const address = await prisma.address.findFirst({
      where: { id },
    });

    if (!address) {
      throw new Error('Address not found !');
    }
    if (address.isDelete === true) {
      throw new Error('Address not found !');
    }

    const updateAddress = await prisma.address.update({
      where: { id },
      data: { isDelete: true },
    });

    return { message: 'Delete address success', data: updateAddress };
  } catch (error) {
    throw error;
  }
};