import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export class DemoController {
  static async getInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);

      const invoice = await prisma.invoice.findUnique({
        where: { id },
        select: {
          id: true,
          number: true,
          description: true,
          amount: true,
          currency: true,
          dueDate: true,
          clientEmail: true,
          status: true,
          pdfUrl: true,
          stripeCheckoutUrl: true,
          paidAt: true,
          user: { select: { name: true } },
          client: { select: { name: true, company: true } },
        },
      });

      if (!invoice) return errorResponse(res, 'Invoice not found', 404);

      return successResponse(res, invoice);
    } catch (err) {
      next(err);
    }
  }

  static async payInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);

      const invoice = await prisma.invoice.findUnique({
        where: { id },
        select: { stripeCheckoutUrl: true, status: true },
      });

      if (!invoice) return errorResponse(res, 'Invoice not found', 404);
      if (invoice.status === 'PAID') return errorResponse(res, 'Invoice already paid', 400);
      if (!invoice.stripeCheckoutUrl) return errorResponse(res, 'Payment link unavailable', 503);

      return successResponse(res, { url: invoice.stripeCheckoutUrl });
    } catch (err) {
      next(err);
    }
  }
}
