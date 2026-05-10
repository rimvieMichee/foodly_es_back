import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { PublicService } from './public.service';
import { CreatePublicOrderDto } from './dto/create-public-order.dto';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('restaurant/:restaurantId')
  getRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.publicService.getRestaurant(restaurantId);
  }

  @Get('restaurant/:restaurantId/menu')
  getMenu(@Param('restaurantId') restaurantId: string) {
    return this.publicService.getMenu(restaurantId);
  }

  @Get('restaurant/:restaurantId/tables')
  getTables(@Param('restaurantId') restaurantId: string) {
    return this.publicService.getTables(restaurantId);
  }

  @Post('orders')
  createOrder(@Body() dto: CreatePublicOrderDto) {
    return this.publicService.createOrder(dto);
  }

  @Get('orders/:orderId')
  getOrderStatus(@Param('orderId') orderId: string) {
    return this.publicService.getOrderStatus(orderId);
  }
}
