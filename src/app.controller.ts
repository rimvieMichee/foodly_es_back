import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealth() {
    return {
      status: 'ok',
      message: 'Foodly API is running',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        docs: '/api/docs',
        auth: '/api/auth',
        users: '/api/users',
        menuItems: '/api/menu-items',
        tables: '/api/tables',
        orders: '/api/orders',
        dashboard: '/api/dashboard',
      },
    };
  }

  @Get('health')
  getHealthCheck() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
