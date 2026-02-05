import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async submitPaymentProof(studentId: string, orderId: string, imageUrl: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.studentId !== studentId) {
      throw new ForbiddenException('Order not found or not yours');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.paymentProof.create({
        data: {
          orderId,
          imageUrl,
        },
      });

      return tx.order.update({
        where: { id: orderId },
        data: { paymentStatus: PaymentStatus.PENDING },
      });
    });
  }

  async confirmPayment(staffId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException('Order not found');

    // Check staff perm
    const staffBranch = await this.prisma.staffBranch.findUnique({
      where: { staffId },
    });

    if (!staffBranch || staffBranch.branchId !== order.branchId) {
      throw new ForbiddenException('Permission denied');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: PaymentStatus.PAID },
    });
  }
}
