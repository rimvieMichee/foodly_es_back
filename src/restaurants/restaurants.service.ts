import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async create(createRestaurantDto: CreateRestaurantDto) {
    // Vérifier si l'email de l'admin existe déjà
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createRestaurantDto.adminEmail },
    });

    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    // Hasher le mot de passe de l'admin
    const hashedPassword = await bcrypt.hash(createRestaurantDto.adminPassword, 10);

    // Créer le restaurant et l'admin en une transaction
    const { adminFirstName, adminLastName, adminEmail, adminPhone, adminPassword, ...restaurantData } = createRestaurantDto;

    return this.prisma.restaurant.create({
      data: {
        ...restaurantData,
        subscriptionEndDate: restaurantData.subscriptionEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        users: {
          create: {
            email: adminEmail,
            password: hashedPassword,
            firstName: adminFirstName,
            lastName: adminLastName,
            phone: adminPhone,
            role: 'ADMIN',
            status: 'ACTIVE',
          },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }

  async findAll(status?: string) {
    const restaurants = await this.prisma.restaurant.findMany({
      where: status ? { status: status as any } : {},
      include: {
        _count: {
          select: {
            users: true,
            tables: true,
          },
        },
        users: {
          select: {
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transformer les données pour inclure serverCount et tableCount
    return restaurants.map(restaurant => ({
      ...restaurant,
      serverCount: restaurant.users.filter(u => u.role === 'SERVER').length,
      tableCount: restaurant._count.tables,
      users: undefined, // Retirer les users de la réponse
    }));
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

  async getRestaurantStats(restaurantId: string) {
    // Vérifier que le restaurant existe
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant non trouvé');
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Calculer les statistiques quotidiennes
    const dailyOrders = await this.prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: { gte: startOfDay },
        status: 'DELIVERED',
      },
      include: { items: true },
    });

    const dailyRevenue = dailyOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Calculer les statistiques mensuelles
    const monthlyOrders = await this.prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: { gte: startOfMonth },
        status: 'DELIVERED',
      },
      include: { items: true },
    });

    const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Calculer les statistiques annuelles
    const yearlyOrders = await this.prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: { gte: startOfYear },
        status: 'DELIVERED',
      },
      include: { items: true },
    });

    const yearlyRevenue = yearlyOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Calculer les revenus par mois pour le graphique (12 derniers mois)
    const monthlyRevenueData = [];
    const monthLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(now.getFullYear(), i, 1);
      const monthEnd = new Date(now.getFullYear(), i + 1, 0, 23, 59, 59);
      
      const orders = await this.prisma.order.findMany({
        where: {
          restaurantId,
          createdAt: { gte: monthStart, lte: monthEnd },
          status: 'DELIVERED',
        },
      });
      
      const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      monthlyRevenueData.push(revenue);
    }

    // Calculer les commandes par jour de la semaine courante (Lun → Dim)
    const weeklyOrdersData = [];
    const weeklyAmountsData = [];
    const dayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    const jsDay = now.getDay(); // 0=Dim, 1=Lun…
    const daysToMonday = jsDay === 0 ? -6 : 1 - jsDay;
    const monday = new Date(now);
    monday.setDate(now.getDate() + daysToMonday);
    monday.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(monday);
      dayStart.setDate(monday.getDate() + i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayOrders = await this.prisma.order.findMany({
        where: {
          restaurantId,
          createdAt: { gte: dayStart, lte: dayEnd },
        },
        select: { totalAmount: true },
      });

      weeklyOrdersData.push(dayOrders.length);
      weeklyAmountsData.push(dayOrders.reduce((sum, o) => sum + o.totalAmount, 0));
    }

    // Récupérer les 5 dernières commandes pour l'activité récente
    const recentOrders = await this.prisma.order.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        table: true,
        items: { include: { menuItem: true } },
      },
    });

    // Calculer la répartition par catégorie
    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        order: {
          restaurantId,
          createdAt: { gte: startOfMonth },
          status: 'DELIVERED',
        },
      },
      include: {
        menuItem: true,
      },
    });

    const categoryStats = orderItems.reduce((acc, item) => {
      const category = item.menuItem?.category || 'Autre';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += item.quantity;
      return acc;
    }, {} as Record<string, number>);

    const totalItems = Object.values(categoryStats).reduce((sum, count) => sum + count, 0);
    const categoryPercentages = Object.entries(categoryStats).map(([category, count]) => ({
      category,
      percentage: totalItems > 0 ? Math.round((count / totalItems) * 100) : 0,
    }));

    // Calculer la croissance (comparaison avec le mois précédent)
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    
    const previousMonthOrders = await this.prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: { gte: previousMonthStart, lte: previousMonthEnd },
        status: 'DELIVERED',
      },
    });

    const previousMonthRevenue = previousMonthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const monthlyGrowth = previousMonthRevenue > 0 
      ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
      : 0;

    return {
      daily: {
        revenue: dailyRevenue,
        orders: dailyOrders.length,
        growth: 0, // Calculer si nécessaire
      },
      monthly: {
        revenue: monthlyRevenue,
        orders: monthlyOrders.length,
        growth: Math.round(monthlyGrowth * 10) / 10,
      },
      yearly: {
        revenue: yearlyRevenue,
        orders: yearlyOrders.length,
        growth: 0, // Calculer si nécessaire
      },
      charts: {
        revenue: {
          labels: monthLabels,
          data: monthlyRevenueData,
        },
        orders: {
          labels: dayLabels,
          data: weeklyOrdersData,
          amounts: weeklyAmountsData,
        },
        categories: categoryPercentages,
      },
      recentActivity: recentOrders.map((order) => ({
        id: order.id,
        title: `Commande table ${order.table?.number ?? '?'} — ${order.items.length} article(s)`,
        status: order.status,
        createdAt: order.createdAt,
      })),
    };
  }
}
