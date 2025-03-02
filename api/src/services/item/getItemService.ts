import prisma from "../../prisma"


export const getItemService = async () => {
    try {
        const response = prisma.laundryItem.findMany({
            select: {
                id: true,
                itemName: true,
            }
        })
        return response
    } catch (error) {
        throw error
    }
}