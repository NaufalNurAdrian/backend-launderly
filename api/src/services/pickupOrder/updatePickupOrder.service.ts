import prisma from '@/prisma';
import { OrderStatus, PickupStatus } from '@prisma/client';

interface UpdatePickupOrderBody {
  shipmentOrderId: number,
  driverId: number,
  status: string
}
export const updatePickupOrderService = async (
  body: UpdatePickupOrderBody,
) => {
  try {
    const { driverId, shipmentOrderId, status } = body;

    const existingPickupOrder = await prisma.pickupOrder.findFirst({
      where: { id: shipmentOrderId },
      select: { pickupStatus: true }
    })

    if (!existingPickupOrder) {
      throw new Error('Pickup Order not Found!')
    }

    const existingEmployee = await prisma.user.findFirst({
      where: {id: driverId},
      select: {employee: {select: {id: true}}}
    })

    if (!existingEmployee){
      throw new Error('Employee not Found!')
    }

    let orderStatus

    if (status == String(PickupStatus.ON_THE_WAY_TO_CUSTOMER)) {
      orderStatus = OrderStatus.ON_THE_WAY_TO_CUSTOMER
    }
    if (status == String(PickupStatus.ON_THE_WAY_TO_OUTLET)) {
      orderStatus = OrderStatus.ON_THE_WAY_TO_OUTLET
    }
    if (status == String(PickupStatus.RECEIVED_BY_OUTLET)) {
      orderStatus = OrderStatus.ARRIVED_AT_OUTLET
    }

    const updateOrder = await prisma.order.update({
      where: { pickupOrderId: shipmentOrderId },
      data: { orderStatus: orderStatus }
    })

    const updatePickupOrder = await prisma.pickupOrder.update({
      where: { id: shipmentOrderId },
      data: {
        pickupStatus: status as PickupStatus,
        driverId: existingEmployee.employee?.id
      },
    });


    return {
      pickupOrder: updatePickupOrder,
      order: updateOrder
    }

  } catch (error) {
    throw error;
  }
};