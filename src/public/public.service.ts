import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { CreatePublicOrderDto } from './dto/create-public-order.dto';

@Injectable()
export class PublicService {
  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async getRestaurant(restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
        id: true,
        name: true,
        logo: true,
        city: true,
        quartier: true,
        phone: true,
        status: true,
      },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant introuvable');
    }

    if (restaurant.status !== 'ACTIVE') {
      throw new NotFoundException('Ce restaurant n\'est pas disponible');
    }

    return restaurant;
  }

  async getMenu(restaurantId: string) {
    await this.getRestaurant(restaurantId);

    return this.prisma.menuItem.findMany({
      where: { restaurantId, isAvailable: true },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: true,
        subcategory: true,
        imageUrl: true,
        preparationTime: true,
        rating: true,
        isPopular: true,
        allergens: true,
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async getTables(restaurantId: string) {
    await this.getRestaurant(restaurantId);

    return this.prisma.table.findMany({
      where: { restaurantId },
      select: {
        id: true,
        number: true,
        capacity: true,
        status: true,
      },
      orderBy: { number: 'asc' },
    });
  }

  async createOrder(dto: CreatePublicOrderDto) {
    const { items, clientName, clientFcmToken, restaurantId, tableId, tableNumber, totalAmount, notes } = dto;

    await this.getRestaurant(restaurantId);

    const order = await this.prisma.order.create({
      data: {
        restaurantId,
        tableId,
        tableNumber,
        serverName: clientName,
        clientName,
        clientFcmToken: clientFcmToken ?? null,
        totalAmount,
        notes: notes ?? null,
        items: {
          create: items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
            comment: item.comment,
          })),
        },
      },
      include: {
        items: { include: { menuItem: true } },
      },
    });

    this.notificationsGateway.notifyNewOrder({
      orderId: order.id,
      tableNumber: order.tableNumber,
      serverName: clientName,
      clientName,
      totalAmount: order.totalAmount,
      itemCount: order.items.length,
      createdAt: order.createdAt,
      isClientOrder: true,
    });

    return order;
  }

  async getOrderStatus(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        tableNumber: true,
        clientName: true,
        totalAmount: true,
        createdAt: true,
        readyAt: true,
        deliveredAt: true,
        items: {
          include: {
            menuItem: { select: { name: true, price: true } },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Commande introuvable');
    }

    return order;
  }
}
