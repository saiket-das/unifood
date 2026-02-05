import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async createRestaurant(ownerId: string, name: string) {
    return this.prisma.restaurant.create({
      data: {
        name,
        ownerId,
      },
    });
  }

  async getMyRestaurant(ownerId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { ownerId },
      include: {
        branches: true,
      },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found for this owner');
    }

    return restaurant;
  }

  async updateRestaurant(ownerId: string, restaurantId: string, name: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant || restaurant.ownerId !== ownerId) {
      throw new ForbiddenException('You do not own this restaurant');
    }

    return this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: { name },
    });
  }
}
