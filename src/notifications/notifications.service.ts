import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private messaging: admin.messaging.Messaging;

  onModuleInit() {
    // Initialize Firebase Admin SDK only if credentials are provided
    const hasFirebaseConfig = process.env.FIREBASE_PROJECT_ID && 
                               process.env.FIREBASE_CLIENT_EMAIL && 
                               process.env.FIREBASE_PRIVATE_KEY;

    if (!hasFirebaseConfig) {
      console.warn('⚠️  Firebase credentials not configured. Notifications service will be disabled.');
      return;
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
    this.messaging = admin.messaging();
    console.log('✅ Firebase Admin SDK initialized successfully');
  }

  /**
   * Envoyer une notification à un token FCM spécifique
   */
  async sendToDevice(token: string, title: string, body: string, data?: any) {
    if (!this.messaging) {
      console.warn('⚠️  Firebase not configured. Notification not sent.');
      return { success: false, error: 'Firebase not configured', invalidToken: false };
    }

    try {
      const message: admin.messaging.Message = {
        notification: {
          title,
          body,
        },
        data: data || {},
        token,
      };

      const response = await this.messaging.send(message);
      console.log('✅ Notification sent successfully:', response);
      return { success: true, messageId: response, invalidToken: false };
    } catch (error) {
      // Gérer les tokens invalides ou non enregistrés
      if (error.code === 'messaging/registration-token-not-registered' || 
          error.code === 'messaging/invalid-registration-token') {
        console.warn('⚠️  Invalid or unregistered FCM token. Token should be removed from database.');
        return { success: false, error: error.message, invalidToken: true };
      }
      
      // Pour les autres erreurs, logger et retourner
      console.error('❌ Error sending notification:', error);
      return { success: false, error: error.message, invalidToken: false };
    }
  }

  /**
   * Envoyer une notification à plusieurs tokens
   */
  async sendToMultipleDevices(
    tokens: string[],
    title: string,
    body: string,
    data?: any,
  ) {
    if (!this.messaging) {
      console.warn('⚠️  Firebase not configured. Notifications not sent.');
      return { success: false, error: 'Firebase not configured' };
    }

    try {
      const message: admin.messaging.MulticastMessage = {
        notification: {
          title,
          body,
        },
        data: data || {},
        tokens,
      };

      const response = await this.messaging.sendEachForMulticast(message);
      console.log(
        `✅ ${response.successCount} notifications sent successfully`,
      );
      console.log(`❌ ${response.failureCount} notifications failed`);
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      console.error('❌ Error sending multicast notification:', error);
      throw error;
    }
  }

  /**
   * Envoyer une notification pour une nouvelle commande
   */
  async sendNewOrderNotification(
    token: string,
    orderData: {
      orderId: string;
      tableNumber: string;
      totalAmount: number;
      itemCount: number;
    },
  ) {
    return this.sendToDevice(
      token,
      '🔔 Nouvelle commande',
      `Table ${orderData.tableNumber} - ${orderData.itemCount} article(s) - ${orderData.totalAmount} FCFA`,
      {
        type: 'NEW_ORDER',
        orderId: orderData.orderId,
        tableNumber: orderData.tableNumber,
      },
    );
  }

  /**
   * Envoyer une notification pour un changement de statut de commande
   */
  async sendOrderStatusNotification(
    token: string,
    orderData: {
      orderId: string;
      tableNumber: string;
      status: string;
    },
  ) {
    const statusMessages = {
      PENDING: 'En attente',
      IN_PREPARATION: 'En préparation',
      READY: 'Prête à servir',
      DELIVERED: 'Livrée',
      CANCELLED: 'Annulée',
    };

    const statusMessage = statusMessages[orderData.status] || orderData.status;

    return this.sendToDevice(
      token,
      '📋 Mise à jour de commande',
      `Table ${orderData.tableNumber} - ${statusMessage}`,
      {
        type: 'ORDER_STATUS_UPDATE',
        orderId: orderData.orderId,
        tableNumber: orderData.tableNumber,
        status: orderData.status,
      },
    );
  }

  /**
   * Envoyer une notification à tous les serveurs d'un restaurant
   */
  async notifyRestaurantServers(
    restaurantId: string,
    title: string,
    body: string,
    data?: any,
  ) {
    // TODO: Récupérer les tokens FCM de tous les serveurs du restaurant depuis la DB
    // Pour l'instant, cette méthode est un placeholder
    console.log(
      `📢 Notification to all servers of restaurant ${restaurantId}:`,
      title,
    );
    return { success: true, message: 'Feature to be implemented' };
  }
}
