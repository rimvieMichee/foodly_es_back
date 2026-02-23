import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDailyMenuDto } from './dto/create-daily-menu.dto';
import { UpdateDailyMenuDto } from './dto/update-daily-menu.dto';

@Injectable()
export class DailyMenusService {
  constructor(private prisma: PrismaService) {}

  async create(createDailyMenuDto: CreateDailyMenuDto) {
    if (!createDailyMenuDto.restaurantId) {
      throw new Error('restaurantId is required');
    }

    return this.prisma.dailyMenu.create({
      data: {
        name: createDailyMenuDto.name,
        description: createDailyMenuDto.description,
        originalPrice: createDailyMenuDto.originalPrice,
        discountedPrice: createDailyMenuDto.discountedPrice,
        discountPercent: createDailyMenuDto.discountPercent,
        menuItemIds: createDailyMenuDto.menuItemIds,
        restaurantId: createDailyMenuDto.restaurantId,
        isActive: createDailyMenuDto.isActive ?? true,
        validFrom: createDailyMenuDto.validFrom ? new Date(createDailyMenuDto.validFrom) : new Date(),
        validUntil: new Date(createDailyMenuDto.validUntil),
      },
    });
  }

  async findAll(restaurantId?: string, isActive?: boolean) {
    return this.prisma.dailyMenu.findMany({
      where: {
        ...(restaurantId && { restaurantId }),
        ...(isActive !== undefined && { isActive }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.dailyMenu.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateDailyMenuDto: UpdateDailyMenuDto) {
    const updateData: any = {
      ...(updateDailyMenuDto.name && { name: updateDailyMenuDto.name }),
      ...(updateDailyMenuDto.description !== undefined && { description: updateDailyMenuDto.description }),
      ...(updateDailyMenuDto.originalPrice !== undefined && { originalPrice: updateDailyMenuDto.originalPrice }),
      ...(updateDailyMenuDto.discountedPrice !== undefined && { discountedPrice: updateDailyMenuDto.discountedPrice }),
      ...(updateDailyMenuDto.discountPercent !== undefined && { discountPercent: updateDailyMenuDto.discountPercent }),
      ...(updateDailyMenuDto.menuItemIds && { menuItemIds: updateDailyMenuDto.menuItemIds }),
      ...(updateDailyMenuDto.isActive !== undefined && { isActive: updateDailyMenuDto.isActive }),
      ...(updateDailyMenuDto.validFrom && { validFrom: new Date(updateDailyMenuDto.validFrom) }),
      ...(updateDailyMenuDto.validUntil && { validUntil: new Date(updateDailyMenuDto.validUntil) }),
    };

    return this.prisma.dailyMenu.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    return this.prisma.dailyMenu.delete({
      where: { id },
    });
  }

  async toggleActive(id: string) {
    const dailyMenu = await this.prisma.dailyMenu.findUnique({
      where: { id },
    });

    return this.prisma.dailyMenu.update({
      where: { id },
      data: { isActive: !dailyMenu.isActive },
    });
  }

  async getActiveMenus(restaurantId: string) {
    const now = new Date();
    return this.prisma.dailyMenu.findMany({
      where: {
        restaurantId,
        isActive: true,
        validFrom: { lte: now },
        validUntil: { gte: now },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
