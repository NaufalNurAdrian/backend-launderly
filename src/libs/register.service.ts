import prisma from "../prisma";

//customer
export const findCust = async (email: string) => {
  const userCust = await prisma.user.findFirst({
    where: { email: email },
  });
  return userCust;
};
