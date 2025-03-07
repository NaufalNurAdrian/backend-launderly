import { Request, Response } from "express";
import prisma from "../../prisma";

export const confirmOrderService = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required!" });
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId, 10) },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found!" });
    }

    if (order.isConfirm) {
      return res.status(400).json({ message: "Order is already confirmed!" });
    }

    if (order.orderStatus !== "RECEIVED_BY_CUSTOMER") {
      return res.status(400).json({ message: "Order cannot be confirmed at this stage!" });
    }

    const updatedOrder = await prisma.$transaction([
      prisma.order.update({
        where: { id: parseInt(orderId, 10) },
        data: {
          orderStatus: "COMPLETED",
          isConfirm: true,
          confirmedAt: new Date(), 
        },
      }),
    ]);

    return res.status(200).json({
      message: "Order has been confirmed successfully!",
      order: updatedOrder[0], 
    });
  } catch (error) {
    console.error("Error confirming order:", error);
    return res.status(500).json({ message: "An internal server error occurred!" });
  }
};
