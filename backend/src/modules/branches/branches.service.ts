import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as argon2 from 'argon2';
import { UserRole } from '@prisma/client';

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

    const { paymentOptions, ...branchData } = data;

    return this.prisma.$transaction(async (tx) => {
      const branch = await tx.branch.create({
        data: {
          ...branchData,
          restaurantId,
        },
      });

      // Default to Cash enabled if no payment options provided
      const optionsToCreate = paymentOptions || [{ method: 'CASH', isEnabled: true }];

      await Promise.all(
        optionsToCreate.map((opt) =>
          tx.branchPaymentOption.create({
            data: {
              ...opt,
              branchId: branch.id,
            },
          })
        )
      );

      return tx.branch.findUnique({
        where: { id: branch.id },
        include: { paymentOptions: true },
      });
    });
  }

  async updateBranchPaymentOptions(ownerId: string, branchId: string, options: any[]) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      include: { restaurant: true },
    });

    if (!branch || branch.restaurant.ownerId !== ownerId) {
      throw new ForbiddenException('You do not own this branch');
    }

    return this.prisma.$transaction(async (tx) => {
      await Promise.all(
        options.map((opt) =>
          tx.branchPaymentOption.upsert({
            where: {
              branchId_method: {
                branchId,
                method: opt.method,
              },
            },
            update: opt,
            create: {
              ...opt,
              branchId,
            },
          })
        )
      );

      return tx.branch.findUnique({
        where: { id: branchId },
        include: { paymentOptions: true },
      });
    });
  }

  async getBranchById(branchId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      include: {
        restaurant: true,
        paymentOptions: true,
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

  async inviteStaffByEmail(ownerId: string, branchId: string, data: any) {
    const { email, name, role, temporaryPassword } = data;

    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      include: { restaurant: true },
    });

    if (!branch || branch.restaurant.ownerId !== ownerId) {
      throw new ForbiddenException('You do not own this branch');
    }

    const hashedPassword = await argon2.hash(temporaryPassword);

    return this.prisma.$transaction(async (tx) => {
      // 1. Create or update user
      const user = await tx.user.upsert({
        where: { email },
        update: {
          role,
          password: hashedPassword,
          needsPasswordChange: true,
          name,
        },
        create: {
          email,
          name,
          role,
          password: hashedPassword,
          needsPasswordChange: true,
        },
      });

      // 2. Link to branch if role is STAFF
      if (role === UserRole.STAFF) {
        await tx.staffBranch.upsert({
          where: { staffId: user.id },
          update: { branchId },
          create: { staffId: user.id, branchId },
        });
      }

      return {
        success: true,
        message: `User ${email} invited as ${role}`,
        userId: user.id,
      };
    });
  }

  async getBranchStaff(ownerId: string, branchId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      include: { restaurant: true },
    });

    if (!branch || branch.restaurant.ownerId !== ownerId) {
      throw new ForbiddenException('You do not own this branch');
    }

    return this.prisma.staffBranch.findMany({
      where: { branchId },
      include: {
        staff: {
          select: {
            id: true,
            email: true,
            name: true,
            isActive: true,
            needsPasswordChange: true,
          },
        },
      },
    });
  }

  async removeStaffFromBranch(ownerId: string, branchId: string, staffId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
      include: { restaurant: true },
    });

    if (!branch || branch.restaurant.ownerId !== ownerId) {
      throw new ForbiddenException('You do not own this branch');
    }

    // Just delete the assignment, don't delete the user
    return this.prisma.staffBranch.delete({
      where: { staffId },
    });
  }
}

