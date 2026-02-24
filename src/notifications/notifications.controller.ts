import { Controller, Post, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  async sendNotification(
    @Body()
    body: {
      token: string;
      title: string;
      message: string;
      data?: any;
    },
  ) {
    return this.notificationsService.sendToDevice(
      body.token,
      body.title,
      body.message,
      body.data,
    );
  }

  @Post('send-multiple')
  async sendMultipleNotifications(
    @Body()
    body: {
      tokens: string[];
      title: string;
      message: string;
      data?: any;
    },
  ) {
    return this.notificationsService.sendToMultipleDevices(
      body.tokens,
      body.title,
      body.message,
      body.data,
    );
  }

  @Post('test')
  async testNotification(@Body() body: { token: string }) {
    return this.notificationsService.sendToDevice(
      body.token,
      '🔔 Test Notification',
      'Ceci est une notification de test depuis Foodly',
      { type: 'TEST' },
    );
  }
}
