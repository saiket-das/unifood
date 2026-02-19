import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async createMenuItem(ownerId: string, restaurantId: string, data: any) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant || restaurant.ownerId !== ownerId) {
      throw new ForbiddenException('You do not own this restaurant');
    }

    return this.prisma.menuItem.create({
      data: {
        ...data,
        restaurantId,
      },
    });
  }

  async getMenuItemsByRestaurant(restaurantId: string) {
    return this.prisma.menuItem.findMany({
      where: { restaurantId },
      include: { category: true },
    });
  }

  async searchMenuItems(query: string) {
    return this.prisma.menuItem.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  }

  async setBranchAvailability(staffOrOwnerId: string, branchId: string, menuItemId: string, isAvailable: boolean) {
    // Check perm (Owner or Staff assigned to this branch)
    const canManage = await this.checkBranchPermission(staffOrOwnerId, branchId);
    if (!canManage) {
      throw new ForbiddenException('Permission denied');
    }

    return this.prisma.branchMenuItem.upsert({
      where: {
        branchId_menuItemId: {
          branchId,
          menuItemId,
        },
      },
      update: { isAvailable },
      create: {
        branchId,
        menuItemId,
        isAvailable,
      },
    });
  }

  private async checkBranchPermission(userId: string, branchId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return false;

    if (user.role === 'OWNER') {
      const branch = await this.prisma.branch.findUnique({
        where: { id: branchId },
        include: { restaurant: true },
      });
      return branch?.restaurant.ownerId === userId;
    }

    if (user.role === 'STAFF') {
      const staffBranch = await this.prisma.staffBranch.findUnique({
        where: { staffId: userId },
      });
      return staffBranch?.branchId === branchId;
    }

    return false;
  }
}
