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

    const { categoryIds, branchIds, availableInAllBranches, variants, ...menuItemData } = data;

    // Create Menu Item with Category connections
    const menuItem = await this.prisma.menuItem.create({
      data: {
        ...menuItemData,
        restaurantId,
        categories: {
          connect: categoryIds?.map((id: string) => ({ id })) || [],
        },
        variants: {
          create: variants?.map((v: any) => ({
            name: v.name,
            unitType: v.unitType,
            unitValue: v.unitValue,
            unitLabel: v.unitLabel,
            price: v.price,
            isAvailable: v.isAvailable ?? true,
          })) || [],
        },
      },
      include: { variants: true },
    });

    // Link to branches
    if (branchIds && branchIds.length > 0) {
      await Promise.all(
        branchIds.map((branchId: string) =>
          this.prisma.branchMenuItem.create({
            data: {
              branchId,
              menuItemId: menuItem.id,
              isAvailable: true,
            },
          }),
        ),
      );
    }

    return menuItem;
  }

  async updateMenuItem(ownerId: string, menuItemId: string, data: any) {
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id: menuItemId },
      include: { restaurant: true },
    });

    if (!menuItem || menuItem.restaurant.ownerId !== ownerId) {
      throw new ForbiddenException('You do not own this menu item');
    }

    const { categoryIds, branchIds, availableInAllBranches, variants, ...menuItemData } = data;

    // Update base fields
    const updatedItem = await this.prisma.menuItem.update({
      where: { id: menuItemId },
      data: {
        ...menuItemData,
        categories: categoryIds ? {
          set: categoryIds.map((id: string) => ({ id })),
        } : undefined,
        variants: variants ? {
          deleteMany: {},
          create: variants.map((v: any) => ({
            name: v.name,
            unitType: v.unitType,
            unitValue: v.unitValue,
            unitLabel: v.unitLabel,
            price: v.price,
            isAvailable: v.isAvailable ?? true,
          })),
        } : undefined,
      },
      include: { variants: true, categories: true },
    });

    // Update branch links if provided
    if (branchIds) {
      // Remove existing branch mappings for this item
      await this.prisma.branchMenuItem.deleteMany({
        where: { menuItemId },
      });

      // Create new ones
      await Promise.all(
        branchIds.map((branchId: string) =>
          this.prisma.branchMenuItem.create({
            data: {
              branchId,
              menuItemId,
              isAvailable: true,
            },
          }),
        ),
      );
    }

    return updatedItem;
  }

  async deleteMenuItem(ownerId: string, menuItemId: string) {
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id: menuItemId },
      include: { restaurant: true },
    });

    if (!menuItem || menuItem.restaurant.ownerId !== ownerId) {
      throw new ForbiddenException('You do not own this menu item');
    }

    return this.prisma.menuItem.delete({
      where: { id: menuItemId },
    });
  }

  async getMenuItemsByRestaurant(restaurantId: string) {
    return this.prisma.menuItem.findMany({
      where: { restaurantId },
      include: { 
        categories: true,
        branchItems: true,
        variants: true
      },
    });
  }

  async getBranchMenu(branchId: string) {
    return this.prisma.menuItem.findMany({
      where: {
        restaurant: {
          branches: {
            some: { id: branchId }
          }
        },
        branchItems: {
          some: { branchId }
        }
      },
      include: {
        categories: true,
        variants: true,
        branchItems: {
          where: { branchId }
        }
      }
    });
  }

  async searchMenuItems(query: string) {
    return this.prisma.menuItem.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ]
      },
      include: { 
        categories: true,
        variants: true
      },
      orderBy: { name: 'asc' },
    });
  }

  async getAllCategories() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(name: string) {
    return this.prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
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
