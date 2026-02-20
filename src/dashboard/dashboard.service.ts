import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Daily stats
    const dailyOrders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startOfDay },
        status: 'DELIVERED',
      },
    });

    const dailyRevenue = dailyOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const dailyOrderCount = dailyOrders.length;

    // Monthly stats
    const monthlyOrders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startOfMonth },
        status: 'DELIVERED',
      },
    });

    const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const monthlyOrderCount = monthlyOrders.length;

    // Yearly stats
    const yearlyOrders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startOfYear },
        status: 'DELIVERED',
      },
    });

    const yearlyRevenue = yearlyOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const yearlyOrderCount = yearlyOrders.length;

    // Calculate growth (mock data for now)
    const dailyGrowth = 12.5;
    const monthlyGrowth = 8.3;
    const yearlyGrowth = 15.7;

    return {
      daily: {
        revenue: dailyRevenue,
        orders: dailyOrderCount,
        growth: dailyGrowth,
      },
      monthly: {
        revenue: monthlyRevenue,
        orders: monthlyOrderCount,
        growth: monthlyGrowth,
      },
      yearly: {
        revenue: yearlyRevenue,
        orders: yearlyOrderCount,
        growth: yearlyGrowth,
      },
    };
  }

  async getRevenueByMonth() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startOfYear },
        status: 'DELIVERED',
      },
      select: {
        createdAt: true,
        totalAmount: true,
      },
    });

    const revenueByMonth = Array(12).fill(0);

    orders.forEach((order) => {
      const month = order.createdAt.getMonth();
      revenueByMonth[month] += order.totalAmount;
    });

    return {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
      data: revenueByMonth,
    };
  }

  async getOrdersByCategory() {
    const orders = await this.prisma.order.findMany({
      where: { status: 'DELIVERED' },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    const categoryCount = {
      FOOD: 0,
      DRINK: 0,
      DESSERT: 0,
    };

    orders.forEach((order) => {
      order.items.forEach((item) => {
        categoryCount[item.menuItem.category]++;
      });
    });

    return {
      labels: ['Plats', 'Boissons', 'Desserts'],
      data: [categoryCount.FOOD, categoryCount.DRINK, categoryCount.DESSERT],
    };
  }
}
