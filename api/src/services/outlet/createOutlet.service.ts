import prisma from "../../prisma";

export const createOutlet = async (
  outletName: string,
  outletType: "MAIN" | "BRANCH",
  address: [
    { addressLine: string; city: string; latitude: string; longitude: string }
  ]
) => {
  const existingOutletName = await prisma.outlet.findFirst({
    where: { outletName },
  });

  if (existingOutletName) {
    throw new Error("Outlet name already exist !");
  }

  const newOutlet = await prisma.outlet.create({
    data: {
      outletName: outletName,
      outletType: outletType,
      address: {
        create: address,
      },
    },
  });
  return newOutlet;
};
