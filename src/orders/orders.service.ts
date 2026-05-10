import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const { items, specialInstructions, ...orderData } = createOrderDto;

    const order = await this.prisma.order.create({
      data: {
        ...orderData,
        // Mapper specialInstructions vers notes pour compatibilité
        notes: specialInstructions || orderData.notes,
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
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    // Émettre un événement WebSocket pour notifier les admins
    this.notificationsGateway.notifyNewOrder({
      orderId: order.id,
      tableNumber: order.tableNumber,
      serverName: order.serverName,
      totalAmount: order.totalAmount,
      itemCount: order.items.length,
      createdAt: order.createdAt,
    });

    return order;
  }

  async findAll(restaurantId: string, serverId?: string, status?: string) {
    return this.prisma.order.findMany({
      where: {
        restaurantId,
        ...(serverId && { serverId }),
        ...(status && { status: status as any }),
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        table: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        table: true,
        server: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    await this.findOne(id);

    const { items, ...orderData } = updateOrderDto;

    return this.prisma.order.update({
      where: { id },
      data: orderData,
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id);

    const updateData: any = { status };

    if (status === 'READY') {
      updateData.readyAt = new Date();
    } else if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        server: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            fcmToken: true,
          },
        },
      },
    });

    // Notifier le serveur via FCM
    if (updatedOrder.server?.fcmToken) {
      let notificationResult: { success: boolean; invalidToken?: boolean } | undefined;

      if (status === 'IN_PREPARATION') {
        notificationResult = await this.notificationsService.sendToDevice(
          updatedOrder.server.fcmToken,
          '👨‍🍳 Commande en préparation',
          `Table ${updatedOrder.tableNumber} - Votre commande est en cours de préparation`,
          { type: 'ORDER_STATUS_UPDATE', orderId: updatedOrder.id, tableNumber: updatedOrder.tableNumber, status },
        );
      } else if (status === 'READY') {
        notificationResult = await this.notificationsService.sendToDevice(
          updatedOrder.server.fcmToken,
          '✅ Commande prête',
          `Table ${updatedOrder.tableNumber} - La commande est prête à être servie`,
          { type: 'ORDER_STATUS_UPDATE', orderId: updatedOrder.id, tableNumber: updatedOrder.tableNumber, status },
        );
      }

      if (notificationResult?.invalidToken) {
        await this.prisma.user.update({
          where: { id: updatedOrder.server.id },
          data: { fcmToken: null },
        });
      }
    }

    // Notifier le client via FCM si la commande vient du QR code
    if ((updatedOrder as any).clientFcmToken && (status === 'IN_PREPARATION' || status === 'READY')) {
      const clientTitle = status === 'IN_PREPARATION'
        ? '👨‍🍳 Commande en préparation'
        : '✅ Votre commande est prête !';
      const clientBody = status === 'IN_PREPARATION'
        ? 'Votre commande est en cours de préparation, encore un peu de patience...'
        : 'Votre commande est prête ! Le serveur va vous l\'apporter.';

      await this.notificationsService.sendToDevice(
        (updatedOrder as any).clientFcmToken,
        clientTitle,
        clientBody,
        { type: 'ORDER_STATUS_UPDATE', orderId: updatedOrder.id, status },
      );
    }

    // Émettre l'événement WebSocket pour le suivi en temps réel côté client
    this.notificationsGateway.notifyOrderStatusUpdate({
      orderId: updatedOrder.id,
      status: updatedOrder.status,
      tableNumber: updatedOrder.tableNumber,
      clientName: (updatedOrder as any).clientName ?? null,
    });

    return updatedOrder;
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.order.delete({
      where: { id },
    });
  }

  async getOrdersByTable(tableId: string) {
    return this.prisma.order.findMany({
      where: {
        tableId,
        status: { not: 'DELIVERED' },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
