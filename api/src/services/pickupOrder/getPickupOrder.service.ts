import prisma from "@/prisma"

export const getPickupOrderService = async (id: number) => {
    try {
        const pickupOrder = await prisma.pickupOrder.findFirst({
            where: {id},
            include: {user: true, outlet: {include: {address: true}}, order: true, address: true, driver: {include: {user: true}}},
        })
        
        if(!pickupOrder) {
            throw new Error('Pickup Order Not Found')
        }

        return pickupOrder;
    } catch (error) {
        throw error
    }
}