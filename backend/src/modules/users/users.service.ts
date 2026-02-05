import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: {
          include: { favorites: { include: { menuItem: true } } },
        },
        restaurant: true,
        staffBranch: { include: { branch: true } },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
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
}
