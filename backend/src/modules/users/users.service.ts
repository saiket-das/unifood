import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        favorites: { include: { menuItem: true } },
        restaurant: true,
        staffBranch: { include: { branch: true } },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async toggleFavorite(userId: string, menuItemId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_menuItemId: { userId, menuItemId },
      },
    });

    if (existing) {
      await this.prisma.favorite.delete({
        where: { id: existing.id },
      });
      return { favorited: false };
    } else {
      await this.prisma.favorite.create({
        data: { userId, menuItemId },
      });
      return { favorited: true };
    }
  }

  async getFavorites(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: {
        menuItem: {
          include: { category: true, restaurant: true },
        },
      },
    });
    return favorites.map((f) => f.menuItem);
  }

  async searchBranches(query: string, categoryId?: string, hostel?: string) {
    return this.prisma.branch.findMany({
      where: {
        AND: [
          query ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { restaurant: { name: { contains: query, mode: 'insensitive' } } },
            ],
          } : {},
          categoryId ? {
            branchMenuItems: {
              some: {
                menuItem: { categoryId }
              }
            }
          } : {},
          hostel ? {
            hostelTags: { has: hostel }
          } : {},
        ]
      },
      include: {
        restaurant: true,
      },
    });
  }

  async getBranchDetails(branchId: string) {
    return this.prisma.branch.findUnique({
      where: { id: branchId },
      include: {
        restaurant: {
          include: {
            menuItems: {
              include: { category: true, branchItems: { where: { branchId } } }
            }
          }
        }
      }
    });
  }

  async getRecommendedItems(userId: string) {
    // 1. Find most frequently ordered items for this user
    const mostOrdered = await this.prisma.orderItem.groupBy({
      by: ['menuItemId'],
      where: {
        order: {
          studentId: userId,
          status: OrderStatus.COMPLETED,
        },
      },
      _count: {
        menuItemId: true,
      },
      orderBy: {
        _count: {
          menuItemId: 'desc',
        },
      },
      take: 5,
    });

    if (mostOrdered.length === 0) {
      // If no history, return trending items (most ordered globally in the last 30 days)
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const trending = await this.prisma.orderItem.groupBy({
        by: ['menuItemId'],
        where: {
          order: {
            status: OrderStatus.COMPLETED,
            createdAt: { gte: lastMonth },
          },
        },
        _count: {
          menuItemId: true,
        },
        orderBy: {
          _count: {
            menuItemId: 'desc',
          },
        },
        take: 5,
      });

      return this.prisma.menuItem.findMany({
        where: { id: { in: trending.map((item) => item.menuItemId) } },
        include: { category: true, restaurant: true },
      });
    }

    // 2. Fetch full details for these items
    return this.prisma.menuItem.findMany({
      where: { id: { in: mostOrdered.map((item) => item.menuItemId) } },
      include: { category: true, restaurant: true },
    });
  }
}
