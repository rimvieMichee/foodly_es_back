import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('revenue-by-month')
  @ApiOperation({ summary: 'Get revenue by month' })
  getRevenueByMonth() {
    return this.dashboardService.getRevenueByMonth();
  }

  @Get('orders-by-category')
  @ApiOperation({ summary: 'Get orders by category' })
  getOrdersByCategory() {
    return this.dashboardService.getOrdersByCategory();
  }
}
