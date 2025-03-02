import prisma from "../../prisma";

interface BypassOrderWorkerBody {
  orderWorkerId: number;
  action: "accept" | "reject";
}

export const bypassOrderService = async (body: BypassOrderWorkerBody) => {
  try {
    const { action, orderWorkerId } = body;

    const orderWorker = await prisma.orderWorker.findUnique({
      where: { id: orderWorkerId },
      select: { bypassRequest: true, bypassAccepted: true, bypassRejected: true },
    });

    if (!orderWorker) {
      throw new Error("Order Worker tidak ditemukan!");
    }

    if (!orderWorker.bypassRequest) {
      throw new Error("Tidak ada permintaan bypass untuk order ini!");
    }

    if (action === "accept" && orderWorker.bypassAccepted) {
      throw new Error("Bypass sudah diterima sebelumnya!");
    }

    if (action === "reject" && orderWorker.bypassRejected) {
      throw new Error("Bypass sudah ditolak sebelumnya!");
    }

    const updateData =
      action === "accept"
        ? { bypassAccepted: true, bypassRejected: false, bypassRequest: false}
        : { bypassRejected: true, bypassAccepted: false, isComplete: false, bypassRequest: false,  };

    return await prisma.orderWorker.update({
      where: { id: orderWorkerId },
      data: updateData,
    });
  } catch (error: any) {
    console.error("Bypass Order Error:", error.message);
    throw new Error(error.message);
  }
};
