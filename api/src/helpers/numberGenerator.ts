import prisma from "../prisma";

export const generateOrderNumber = async (type: "DLV" | "PCK" | "ORD") => {
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0].replace(/-/g, ""); 

  const count = await prisma.deliveryOrder.count({
    where: {
      createdAt: {
        gte: new Date(`${today.toISOString().split("T")[0]}T00:00:00.000Z`),
        lt: new Date(`${today.toISOString().split("T")[0]}T23:59:59.999Z`),
      },
    },
  });

  const sequence = String(count + 1).padStart(3, "0");
  return `${type}-${formattedDate}-${sequence}`;
};
