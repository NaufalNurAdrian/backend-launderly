import { Request, Response, NextFunction } from "express";
import { createPaymentService } from '../services/payment/createPayment.service';
import { getPaymentService } from '../services/payment/getPayment.service';
import { getPaymentChartService } from '../services/payment/getPaymentChart.service';
import { getPaymentsService } from '../services/payment/getPayments.service';
import { updatePaymentService } from '../services/payment/updatePayment.service';

export class PaymentController {
  async createPaymentController(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await createPaymentService(req.body);
      res.status(200).send(result);
      return
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
      return 
    } catch (error) {
      next(error);
    }
  }
  
  async getPaymentsController(req: Request, res: Response, next: NextFunction) {
    try {
      const query = {
        id: parseInt(res.locals.user.id),
        filterOutlet: parseInt(req.query.filterOutlet as string) || 'all',
        filterMonth: req.query.filterMonth as string,
        filterYear: req.query.filterYear as string,
        take: parseInt(req.query.take as string) || 1000000,
        page: parseInt(req.query.page as string) || 1,
        sortBy: parseInt(req.query.sortBy as string) || 'id',
        sortOrder: req.query.sortOrder as string || 'asc',     
      };
      const result = await getPaymentsService(query);
      res.status(200).send(result);
      return 
    } catch (error) {
      next(error);
    }
  }

  async getPaymentChartController(req: Request, res: Response, next: NextFunction) {
    try {
      const query = {
        id: parseInt(res.locals.user.id),
        filterOutlet: parseInt(req.query.filterOutlet as string) || 'all',
        filterMonth: req.query.filterMonth as string,
        filterYear: req.query.filterYear as string,
      };
      const result = await getPaymentChartService(query);
      res.status(200).send(result);
      return 
    } catch (error) {
      next(error);
    }
  }

  async updatePaymentController(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await updatePaymentService(req.body);
      res.status(200).json({
        status: 'success',
        message: 'OK'
      })
    } catch (error) {
      next(error);
    }
  }
}