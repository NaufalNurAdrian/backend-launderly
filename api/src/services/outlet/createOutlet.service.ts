import prisma from "../../prisma";

interface AddressInput {
  addressLine: string;
  city: string;
  latitude: string;
  longitude: string;
}

interface CreateOutletInput {
  outletName: string;
  outletType: "MAIN" | "BRANCH";
  address: AddressInput[];
}

export const createOutlet = async (data: CreateOutletInput) => {
  try {
    const { outletName, outletType, address } = data;

    const existingOutletName = await prisma.outlet.findFirst({
      where: { outletName },
    });

    if (existingOutletName) {
      throw new Error("Outlet name already exists!");
    }

    const newOutlet = await prisma.outlet.create({
      data: {
        outletName: outletName,
        outletType: outletType,
        address: {
          // create: address,
        },
      },
    });

    return newOutlet;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
