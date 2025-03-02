import prisma from "../../prisma";

interface UpdateItemInput {
  id: number;
  itemName: string;
}

export const updateItemService = async (body: UpdateItemInput) => {
  try {
    const { itemName } = body;
    const existingItem = await prisma.laundryItem.findFirst({
      where: { itemName },
    });

    if (existingItem) {
      throw new Error("Item already exist");
    }

    const updatedItem = await prisma.laundryItem.update({
      where: { id: body.id },
      data: { itemName },
    });
    return updatedItem;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
