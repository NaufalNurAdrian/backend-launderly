import prisma from "../../prisma";


export const deleteOutletService = async (id: number) => {
  try {
    const existingOutlet = await prisma.outlet.findFirst({
      where: { id },
    });

    if (!existingOutlet) {
      throw new Error("outlet not exist!");
    }

    const deleteOutlet = await prisma.outlet.update({
      where: { id },
      data: { isDelete: true },
    });
    return deleteOutlet;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
