import prisma from "../../prisma";


export const deleteItemService = async (id: string) => {
  try {
    const existingItem = await prisma.laundryItem.findFirst({
      where: { id: Number(id) },
    });

    if (!existingItem) {
      throw new Error("Item not exist!");
    }

    const deleteItem = await prisma.laundryItem.update({
      where: { id: Number(id) },
      data: { isDelete: true },
    });
    return deleteItem;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
