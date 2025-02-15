import prisma from "@/prisma";
import { Prisma } from "@prisma/client";


interface UpdatePaymentBody {
  order_id: string,
  transaction_status: string,
  fraud_status: string,
  payment_type: string,
  currency: string,
  status_code: number,
  signature_key: string,
}

export const updatePaymentService = async (
  body: UpdatePaymentBody,
) => {
  try {
    const { order_id, fraud_status, payment_type, transaction_status } = body;

    const existingInvoice = await prisma.payment.findFirst({
      where: { invoiceNumber: order_id },
      select: { id: true, orderId: true, order: {select: {orderStatus: true}} }
    })

    if (!existingInvoice) {
      throw new Error('Invoice Not Found!')
    }

    if (transaction_status == 'capture') {
      if (fraud_status == 'accept') {
        await prisma.payment.update({
          where: { id: existingInvoice.id },
          data: { paymentStatus: "SUCCESSED", paymentMethode: payment_type }
        })
        const dataInput: Prisma.OrderUpdateInput = {
          isPaid: true,
        };
        if(existingInvoice.order.orderStatus == "AWAITING_PAYMENT"){
          dataInput.orderStatus = "READY_FOR_DELIVERY"
        }
        await prisma.order.update({
          where: {id: existingInvoice.orderId},
          data: dataInput
        })
      }
    } else if (transaction_status == 'settlement') {
      await prisma.payment.update({
        where: { id: existingInvoice.id },
        data: { paymentStatus: "SUCCESSED", paymentMethode: payment_type  }
      })
      const dataInput: Prisma.OrderUpdateInput = {
        isPaid: true,
      };
      if(existingInvoice.order.orderStatus == "AWAITING_PAYMENT"){
        dataInput.orderStatus = "READY_FOR_DELIVERY"
      }
      await prisma.order.update({
        where: {id: existingInvoice.orderId},
        data: dataInput
      })
    } else if (transaction_status == 'cancel') {
      await prisma.payment.update({
        where: { id: existingInvoice.id },
        data: { paymentStatus: "CANCELLED", paymentMethode: payment_type  }
      })
    } else if (transaction_status == 'deny') {
      await prisma.payment.update({
        where: { id: existingInvoice.id },
        data: { paymentStatus: "DENIED", paymentMethode: payment_type  }
      })
    } else if (transaction_status == 'expire') {
      await prisma.payment.update({
        where: { id: existingInvoice.id },
        data: { paymentStatus: "EXPIRED", paymentMethode: payment_type  }
      })
    } else if (transaction_status == 'pending') {
      await prisma.payment.update({
        where: { id: existingInvoice.id },
        data: { paymentStatus: "PENDING", paymentMethode: payment_type  }
      })
    }

    return {
      message: "OK"
    }

  } catch (error) {
    throw error;
  }
};