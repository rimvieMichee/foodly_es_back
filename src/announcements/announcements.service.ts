import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  async create(createAnnouncementDto: CreateAnnouncementDto) {
    return this.prisma.announcement.create({
      data: {
        ...createAnnouncementDto,
        validFrom: createAnnouncementDto.validFrom 
          ? new Date(createAnnouncementDto.validFrom) 
          : null,
        validUntil: createAnnouncementDto.validUntil 
          ? new Date(createAnnouncementDto.validUntil) 
          : null,
      },
    });
  }

  async findAll(restaurantId?: string) {
    return this.prisma.announcement.findMany({
      where: restaurantId ? { restaurantId } : undefined,
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findActive(restaurantId: string) {
    const now = new Date();
    
    return this.prisma.announcement.findMany({
      where: {
        restaurantId,
        isActive: true,
        // Exclure seulement les annonces expirées
        OR: [
          // Pas de date de fin (toujours valide)
          { validUntil: null },
          // Date de fin dans le futur
          { validUntil: { gte: now } },
        ],
      },
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findOne(id: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }

    return announcement;
  }

  async update(id: string, updateAnnouncementDto: UpdateAnnouncementDto) {
    await this.findOne(id);

    return this.prisma.announcement.update({
      where: { id },
      data: {
        ...updateAnnouncementDto,
        validFrom: updateAnnouncementDto.validFrom 
          ? new Date(updateAnnouncementDto.validFrom) 
          : undefined,
        validUntil: updateAnnouncementDto.validUntil 
          ? new Date(updateAnnouncementDto.validUntil) 
          : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.announcement.delete({
      where: { id },
    });
  }

  async toggleActive(id: string) {
    const announcement = await this.findOne(id);

    return this.prisma.announcement.update({
      where: { id },
      data: { isActive: !announcement.isActive },
    });
  }
}
