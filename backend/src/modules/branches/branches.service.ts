import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async createBranch(ownerId: string, restaurantId: string, data: any) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant || restaurant.ownerId !== ownerId) {
      throw new ForbiddenException('You do not own this restaurant');
    }

    return this.prisma.branch.create({
      data: {
        ...data,
        restaurantId,
      },
    });
  }

  async getBranchById(branchId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      include: {
        restaurant: true,
      },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return branch;
  }

  async getBranchesByRestaurant(restaurantId: string) {
    return this.prisma.branch.findMany({
      where: { restaurantId },
    });
  }

  async addStaffToBranch(ownerId: string, branchId: string, staffId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      include: { restaurant: true },
    });

    if (!branch || branch.restaurant.ownerId !== ownerId) {
      throw new ForbiddenException('You do not own this branch');
    }

    // Check if staff is already assigned
    const existingStaff = await this.prisma.staffBranch.findUnique({
      where: { staffId },
    });

    if (existingStaff) {
      return this.prisma.staffBranch.update({
        where: { staffId },
        data: { branchId },
      });
    }

    return this.prisma.staffBranch.create({
      data: {
        staffId,
        branchId,
      },
    });
  }
}
