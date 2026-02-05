import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getBranchAnalytics(ownerId: string, branchId: string, period: 'daily' | 'weekly' | 'monthly') {
    // Check permission
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      include: { restaurant: true },
    });

    if (!branch || branch.restaurant.ownerId !== ownerId) {
      throw new ForbiddenException('You do not own this branch');
    }

    const now = new Date();
    let startDate = new Date();

    if (period === 'daily') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'weekly') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'monthly') {
      startDate.setMonth(now.getMonth() - 1);
    }

    const orders = await this.prisma.order.findMany({
      where: {
        branchId,
        createdAt: { gte: startDate },
        status: OrderStatus.COMPLETED,
      },
      include: { items: true },
    });

    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalPrice), 0);
    const totalOrders = orders.length;

    // Top selling items
    const itemCounts: Record<string, { name: string, count: number, revenue: number }> = {};
    
    for (const order of orders) {
      for (const item of order.items) {
        if (!itemCounts[item.menuItemId]) {
          const menuItem = await this.prisma.menuItem.findUnique({ where: { id: item.menuItemId } });
          itemCounts[item.menuItemId] = { name: menuItem?.name || 'Unknown', count: 0, revenue: 0 };
        }
        itemCounts[item.menuItemId].count += item.quantity;
        itemCounts[item.menuItemId].revenue += Number(item.subtotal);
      }
    }

    const topSelling = Object.values(itemCounts).sort((a, b) => b.count - a.count).slice(0, 5);

    return {
      totalRevenue,
      totalOrders,
      topSelling,
    };
  }

  async getRestaurantAnalytics(ownerId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { ownerId },
      include: { branches: true },
    });

    if (!restaurant) throw new ForbiddenException('Restaurant not found');

    const branchStats = await Promise.all(
      restaurant.branches.map(async (branch) => {
        const stats = await this.getBranchAnalytics(ownerId, branch.id, 'monthly');
        return {
          branchName: branch.name,
          ...stats,
        };
      })
    );

    return branchStats;
  }
}
