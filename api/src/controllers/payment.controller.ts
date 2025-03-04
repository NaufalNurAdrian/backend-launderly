import { Request, Response, NextFunction } from "express";
import { createPaymentService } from "../services/payment/createPayment.service";
import { getPaymentService } from "../services/payment/getPayment.service";
import { getPaymentChartService } from "../services/payment/getPaymentChart.service";
import { getUserPaymentsService } from "../services/payment/getPaymentById.service";
import { updateHooktStatus } from "../services/payment/updateHook.service";

export class PaymentController {
  async createPaymentController(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await createPaymentService(req.body);
      res.status(200).send(result);
      return;
    } catch (error) {
      next(error);
    }
  }

  async getPaymentController(req: Request, res: Response, next: NextFunction) {
    try {
      const query = {
        id: parseInt(req.query.id as string),
        orderId: parseInt(req.query.orderId as string),
      };
      const result = await getPaymentService(query);
      res.status(200).send(result);
      return;
    } catch (error) {
      next(error);
    }
  }

  async getPaymentChartController(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const query = {
        id: parseInt(res.locals.user.id),
        filterOutlet: parseInt(req.query.filterOutlet as string) || "all",
        filterMonth: req.query.filterMonth as string,
        filterYear: req.query.filterYear as string,
      };
      const result = await getPaymentChartService(query);
      res.status(200).send(result);
      return;
    } catch (error) {
      next(error);
    }
  }

  async getUserPaymentByIdController(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = Number(req.params.userId);

      if (isNaN(userId)) {
        res.status(400).json({ success: false, message: "Invalid User ID" });
        return;
      }

      const payments = await getUserPaymentsService(userId);

      res.status(200).json({ success: true, payments });
      return;
    } catch (error) {
      next(error);
    }
  }

  async handlePaymentWebhook(req: Request, res: Response) {
    try {
      console.log("Received Midtrans webhook:", req.body);

      const { transaction_status, order_id } = req.body;

      if (!transaction_status || !order_id) {
        res
          .status(400)
          .json({ error: "Missing transaction_status or order_id" });
        return;
      }
      console.log(
        `Processing order_id: ${order_id}, status: ${transaction_status}`
      );
      await updateHooktStatus({ order_id, transaction_status });

      res.status(200).json({ message: "Payment status updated successfully" });
    } catch (error) {
      console.error("Midtrans Webhook Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
