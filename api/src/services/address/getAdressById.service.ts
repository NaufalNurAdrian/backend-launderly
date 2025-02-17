import prisma from "../../prisma";

export const getAddressByIdService = async (id: number) => {
  try {
    const address = await prisma.address.findFirst({
      where: { id: id, isDelete: false },
    });
    if (!address) {
      throw new Error("Address not found !");
    }
    return address;
  } catch (error) {
    throw error;
  }
};
