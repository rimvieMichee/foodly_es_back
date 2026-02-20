import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MenuItemsService {
  constructor(private prisma: PrismaService) {}

  async create(createMenuItemDto: CreateMenuItemDto) {
    // S'assurer que restaurantId est défini
    if (!createMenuItemDto.restaurantId) {
      throw new Error('restaurantId is required');
    }
    
    return this.prisma.menuItem.create({
      data: {
        name: createMenuItemDto.name,
        description: createMenuItemDto.description,
        price: createMenuItemDto.price,
        category: createMenuItemDto.category,
        restaurantId: createMenuItemDto.restaurantId,
        imageUrl: createMenuItemDto.imageUrl,
        isAvailable: createMenuItemDto.isAvailable ?? true,
        preparationTime: createMenuItemDto.preparationTime,
        rating: createMenuItemDto.rating,
        isPopular: createMenuItemDto.isPopular,
        alcoholContent: createMenuItemDto.alcoholContent,
        calories: createMenuItemDto.calories,
        allergens: createMenuItemDto.allergens,
      },
    });
  }

  async findAll(category?: string, isAvailable?: boolean) {
    return this.prisma.menuItem.findMany({
      where: {
        ...(category && { category: category as any }),
        ...(isAvailable !== undefined && { isAvailable }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id },
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    return menuItem;
  }

  async update(id: string, updateMenuItemDto: UpdateMenuItemDto) {
    await this.findOne(id);

    return this.prisma.menuItem.update({
      where: { id },
      data: updateMenuItemDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.menuItem.delete({
      where: { id },
    });
  }

  async toggleAvailability(id: string) {
    const menuItem = await this.findOne(id);

    return this.prisma.menuItem.update({
      where: { id },
      data: { isAvailable: !menuItem.isAvailable },
    });
  }
}
