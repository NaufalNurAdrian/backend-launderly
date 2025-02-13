import prisma from "../../../prisma"

export const getOrderItem = async (orderId: number) => {
try{
    const orderItem = await prisma.orderItem.findMany({
        where: {
          orderId: orderId
        }
        ,include: {
          laundryItem: true
        }
      });
    return orderItem
}catch(err){
    throw(err)
}
}