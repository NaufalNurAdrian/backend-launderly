import prisma from "../../prisma";

interface UpdateItemInput {
  id: number;
  itemName: string;
}

export const updateItemService = async (body: UpdateItemInput) => {
  try {
    const existingItem = await prisma.laundryItem.findFirst({
      where: { itemName: body.itemName },
    });

    if (existingItem) {
      throw new Error("Item already exist");
    }

    const updatedItem = await prisma.laundryItem.update({
      where: { id: Number(body.id) },
      data: { itemName: body.itemName },
    });
    return updatedItem;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
