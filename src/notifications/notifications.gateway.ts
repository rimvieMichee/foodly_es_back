import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`🔌 Client connecté: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`🔌 Client déconnecté: ${client.id}`);
  }

  // Émettre une notification de nouvelle commande à tous les admins
  notifyNewOrder(orderData: any) {
    console.log('🔔 Émission notification nouvelle commande:', orderData);
    this.server.emit('newOrder', orderData);
  }

  // Émettre une notification de changement de statut
  notifyOrderStatusUpdate(orderData: any) {
    console.log('📋 Émission notification changement statut:', orderData);
    this.server.emit('orderStatusUpdate', orderData);
  }
}
