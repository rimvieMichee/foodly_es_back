import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async create(createRestaurantDto: CreateRestaurantDto) {
    return this.prisma.restaurant.create({
      data: {
        ...createRestaurantDto,
        subscriptionEndDate: createRestaurantDto.subscriptionEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours par défaut
      },
    });
  }

  async findAll(status?: string) {
    return this.prisma.restaurant.findMany({
      where: status ? { status: status as any } : {},
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            status: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    return restaurant;
  }

  async update(id: string, updateRestaurantDto: UpdateRestaurantDto) {
    await this.findOne(id);

    return this.prisma.restaurant.update({
      where: { id },
      data: updateRestaurantDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.restaurant.delete({
      where: { id },
    });
  }

  async getStats() {
    const totalRestaurants = await this.prisma.restaurant.count();
    const activeRestaurants = await this.prisma.restaurant.count({
      where: { status: 'ACTIVE' },
    });
    const totalAdmins = await this.prisma.user.count({
      where: { role: 'ADMIN' },
    });
    const totalServers = await this.prisma.user.count({
      where: { role: 'SERVER' },
    });

    // Calculer les revenus (exemple simplifié)
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const restaurantsThisMonth = await this.prisma.restaurant.count({
      where: {
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
    });

    return {
      totalRestaurants,
      activeRestaurants,
      totalAdmins,
      totalServers,
      revenueThisMonth: totalRestaurants * 300000, // Exemple: 300 000 FCFA par restaurant
      revenueGrowth: 12.5,
      newRestaurantsThisMonth: restaurantsThisMonth,
    };
  }
}
