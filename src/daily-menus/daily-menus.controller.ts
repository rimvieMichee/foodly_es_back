import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DailyMenusService } from './daily-menus.service';
import { CreateDailyMenuDto } from './dto/create-daily-menu.dto';
import { UpdateDailyMenuDto } from './dto/update-daily-menu.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('daily-menus')
@Controller('daily-menus')
export class DailyMenusController {
  constructor(private readonly dailyMenusService: DailyMenusService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() createDailyMenuDto: CreateDailyMenuDto, @Req() req) {
    const restaurantId = req.user?.restaurantId;
    
    if (!restaurantId) {
      throw new Error('restaurantId is missing from JWT token');
    }
    
    return this.dailyMenusService.create({
      ...createDailyMenuDto,
      restaurantId
    });
  }

  @Get()
  findAll(@Query('restaurantId') restaurantId?: string, @Query('isActive') isActive?: string) {
    return this.dailyMenusService.findAll(
      restaurantId,
      isActive !== undefined ? isActive === 'true' : undefined
    );
  }

  @Get('active/:restaurantId')
  getActiveMenus(@Param('restaurantId') restaurantId: string) {
    return this.dailyMenusService.getActiveMenus(restaurantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dailyMenusService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateDailyMenuDto: UpdateDailyMenuDto) {
    return this.dailyMenusService.update(id, updateDailyMenuDto);
  }

  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  toggleActive(@Param('id') id: string) {
    return this.dailyMenusService.toggleActive(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.dailyMenusService.remove(id);
  }
}
