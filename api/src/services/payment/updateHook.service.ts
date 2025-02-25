import prisma from "../../prisma";
import { PaymentStatus } from "@prisma/client"; // Import enum dari Prisma


export async function updatePaymentStatus(orderId: string, transactionStatus: string) {
  // Mapping status dari Midtrans ke sistem internal
  const statusMapping: { [key: string]: PaymentStatus } = {
    settlement: PaymentStatus.SUCCESSED,
    pending: PaymentStatus.PENDING,
    expire: PaymentStatus.EXPIRED,
    cancel: PaymentStatus.CANCELLED,
    deny: PaymentStatus.DENIED
  };
  

  const mappedStatus = statusMapping[transactionStatus];

  if (!mappedStatus) {
    throw new Error(`Invalid transaction_status received from Midtrans: ${transactionStatus}`);
  }

  // Update status pembayaran di database
  return prisma.payment.update({
    where: { invoiceNumber: orderId },
    data: { paymentStatus: mappedStatus },
  });
}
