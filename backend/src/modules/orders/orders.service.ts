import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private realtimeGateway: RealtimeGateway,
  ) {}

  async createOrder(studentId: string, data: any) {
    // Generate order number (e.g., UM-XXXX)
    const orderNumber = `UM-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          studentId,
          branchId: data.branchId,
          totalPrice: data.totalPrice,
          paymentMethod: data.paymentMethod,
          status: OrderStatus.PLACED,
          items: {
            create: data.items.map((item) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
              isMeasured: item.isMeasured || false,
            })),
          },
        },
        include: {
          items: true,
          branch: true,
        },
      });

      await tx.orderStatusEvent.create({
        data: {
          orderId: newOrder.id,
          status: OrderStatus.PLACED,
          note: 'Order placed by student',
        },
      });

      return newOrder;
    });

    // Notify restaurant branch
    this.realtimeGateway.notifyBranch(order.branchId, 'order:placed', order);

    return order;
  }

  async updateStatus(staffId: string, orderId: string, status: OrderStatus, note?: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new NotFoundException('Order not found');

    // Check staff permission for this branch
    const staffBranch = await this.prisma.staffBranch.findUnique({
      where: { staffId },
    });

    if (!staffBranch || staffBranch.branchId !== order.branchId) {
      throw new ForbiddenException('You can only update orders for your branch');
    }

    // Logic for Measured items: price must be finalized if status is moving past PLACED or if it's the measurement step
    if (status === OrderStatus.PREPARING) {
      const hasUnfinalizedMeasuredItems = order.items.some(
        (item) => item.isMeasured && item.finalQuantity === null
      );
      if (hasUnfinalizedMeasuredItems) {
        throw new BadRequestException('All measured items must be finalized before preparing');
      }
    }

    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status },
        include: { items: true },
      });

      await tx.orderStatusEvent.create({
        data: {
          orderId,
          status,
          note,
          staffId,
        },
      });

      return updated;
    });

    // Notify student
    this.realtimeGateway.notifyStudent(order.studentId, `order:${status.toLowerCase()}`, updatedOrder);
    // Notify branch staff
    this.realtimeGateway.notifyBranch(order.branchId, `order:${status.toLowerCase()}`, updatedOrder);

    return updatedOrder;
  }

  async finalizeMeasuredItem(staffId: string, orderItemId: string, finalQuantity: number) {
    const orderItem = await this.prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: { 
        order: true,
        menuItem: true,
       },
    });

    if (!orderItem) throw new NotFoundException('Order item not found');

    // Check staff permission
    const staffBranch = await this.prisma.staffBranch.findUnique({
      where: { staffId },
    });

    if (!staffBranch || staffBranch.branchId !== orderItem.order.branchId) {
      throw new ForbiddenException('Permission denied');
    }

    if (!orderItem.isMeasured) {
      throw new BadRequestException('This item is not a measured item');
    }

    // Calculate final price: unitPrice × (finalQuantity / unitSize)
    const unitPrice = Number(orderItem.menuItem.unitPrice);
    const unitSize = orderItem.menuItem.unitSize || 100;
    const finalPrice = unitPrice * (finalQuantity / unitSize);

    return this.prisma.$transaction(async (tx) => {
      const updatedItem = await tx.orderItem.update({
        where: { id: orderItemId },
        data: {
          finalQuantity,
          subtotal: finalPrice,
        },
      });

      // Update total price of order
      const allItems = await tx.orderItem.findMany({
        where: { orderId: orderItem.orderId },
      });

      const newTotal = allItems.reduce((sum, item) => sum + Number(item.subtotal), 0);

      await tx.order.update({
        where: { id: orderItem.orderId },
        data: { totalPrice: newTotal },
      });

      return updatedItem;
    });
  }

  async getOrdersByBranch(userId: string, role: string, branchId: string) {
    // 1. Validate Access
    if (role === 'STAFF') {
      const staffBranch = await this.prisma.staffBranch.findUnique({
        where: { staffId: userId },
      });
      if (!staffBranch || staffBranch.branchId !== branchId) {
        throw new ForbiddenException('You can only view orders for your assigned branch');
      }
    } else if (role === 'OWNER') {
      const branch = await this.prisma.branch.findUnique({
        where: { id: branchId },
        include: { restaurant: true },
      });
      if (!branch) throw new NotFoundException('Branch not found');
      if (branch.restaurant.ownerId !== userId) {
        throw new ForbiddenException('You do not own this restaurant branch');
      }
    }

    // 2. Fetch Orders
    return this.prisma.order.findMany({
      where: { branchId },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
