import prisma from '@/prisma';

interface CreatePickupOrderBody {
    outletId: number
    userId: number
    userAddressId: number
    pickupPrice: number
    distance: number
}
export const createOrderPickupOrderService = async (
    body: CreatePickupOrderBody,
) => {
    try {
        const { outletId, userAddressId, userId, distance, pickupPrice } = body;

        const existingUser = await prisma.user.findFirst({
            where: { id: userId },
            select: { id: true }
        })

        if (!existingUser) {
            throw new Error("User Not Found!")
        }

        const padNumber = (num: number, size: number): string => {
            let s = num.toString();
            while (s.length < size) s = '0' + s;
            return s;
        };

        const getNextNumber = (lastReferenceNumber: string | undefined) => {
            if (!lastReferenceNumber) {
                return padNumber(1, 4);
            }
            const numberParts = lastReferenceNumber.split('-');
            const lastPart = numberParts.pop();
            if (!lastPart) {
                throw new Error('Invalid number format');
            }
            const lastNumber = parseInt(lastPart, 10);
            if (isNaN(lastNumber)) {
                throw new Error('Last part of the number is not a valid number');
            }
            return padNumber(lastNumber + 1, 4);
        };

        const lastPickupNumber = await prisma.pickupOrder.findFirst({
            where: {
                pickupNumber: {
                    contains: `PO-${padNumber(existingUser.id, 4)}-${padNumber(outletId, 3)}-`
                }
            },
            orderBy: {
                pickupNumber: 'desc'
            }
        });

        const nextPickupNumber = getNextNumber(lastPickupNumber?.pickupNumber);
        const pickupNumber = `PO-${padNumber(existingUser.id, 4)}-${padNumber(outletId, 3)}-${nextPickupNumber}`;

        const lastOrderNumber = await prisma.order.findFirst({
            where: {
                orderNumber: {
                    contains: `OR-${padNumber(existingUser.id, 4)}-${padNumber(outletId, 3)}-`
                }
            },
            orderBy: {
                orderNumber: 'desc'
            }
        })

        const nextOrderNumber = getNextNumber(lastOrderNumber?.orderNumber);
        const orderNumber = `OR-${padNumber(existingUser.id, 4)}-${padNumber(outletId, 3)}-${nextOrderNumber}`;

        const lastDeliveryNumber = await prisma.deliveryOrder.findFirst({
            where: {
                deliveryNumber: {
                    contains: `DO-${padNumber(existingUser.id, 4)}-${padNumber(outletId, 3)}-`
                }
            },
            orderBy: {
                deliveryNumber: 'desc'
            }
        })

        const nextDeliveryNumber = getNextNumber(lastDeliveryNumber?.deliveryNumber);
        const deliveryNumber = `DO-${padNumber(existingUser.id, 4)}-${padNumber(outletId, 3)}-${nextDeliveryNumber}`

        const newPickup = await prisma.$transaction(async (tx) => {

            const createPickupOrder = await tx.pickupOrder.create({
                data: {
                    pickupNumber: pickupNumber,
                    outletId: outletId,
                    userId: userId,
                    addressId: userAddressId,
                    distance: distance,
                    pickupPrice: pickupPrice,
                },
            });

            const createOrder = await tx.order.create({
                data: {
                    orderNumber: orderNumber,
                    pickupOrderId: createPickupOrder.id,
                }
            })

            const createDeliveryOrder = await tx.deliveryOrder.create({
                data: {
                    deliveryNumber: deliveryNumber,
                    orderId: createOrder.id,
                    userId: userId,
                    addressId: userAddressId,
                    distance: distance,
                    deliveryPrice: pickupPrice
                }
            })

            const createNotification = await tx.notification.create({
                data: {
                    title: "Incoming Pickup Order",
                    description: "New pickup request at your outlet",
                }
            })

            const getUserId = await tx.employee.findMany({
                where: {
                    outletId: outletId,
                    workShift: null,
                    station: null,
                },
                select: { userId: true }
            })
            const userIds = getUserId.map(user => user.userId)
            const createUserNotification = await Promise.all(userIds.map(async (userId) => {
                await tx.userNotification.create({
                    data: {
                        notificationId: createNotification.id,
                        userId: userId
                    }
                });
            }));

            return {
                pickupOrder: createPickupOrder,
                order: createOrder,
                deliveryOrder: createDeliveryOrder,
                userNotification: createUserNotification,
            }
        })
        return newPickup
    } catch (error) {
        throw error;
    }
};