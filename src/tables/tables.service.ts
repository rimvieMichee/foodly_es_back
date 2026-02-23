import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Injectable()
export class TablesService {
  constructor(private prisma: PrismaService) {}

  async create(createTableDto: CreateTableDto) {
    const existingTable = await this.prisma.table.findUnique({
      where: { 
        restaurantId_number: {
          restaurantId: createTableDto.restaurantId,
          number: createTableDto.number
        }
      },
    });

    if (existingTable) {
      throw new ConflictException('Table number already exists for this restaurant');
    }

    return this.prisma.table.create({
      data: createTableDto,
    });
  }

  async findAll(status?: string, restaurantId?: string) {
    const where: any = {};
    
    if (status) {
      // Convertir le status en majuscules pour correspondre à l'enum TableStatus
      where.status = status.toUpperCase() as any;
    }
    
    if (restaurantId) {
      where.restaurantId = restaurantId;
    }
    
    return this.prisma.table.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { number: 'asc' },
    });
  }

  async findOne(id: string) {
    const table = await this.prisma.table.findUnique({
      where: { id },
      include: {
        orders: {
          where: { status: { not: 'DELIVERED' } },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    return table;
  }

  async update(id: string, updateTableDto: UpdateTableDto) {
    await this.findOne(id);

    return this.prisma.table.update({
      where: { id },
      data: updateTableDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.table.delete({
      where: { id },
    });
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id);

    return this.prisma.table.update({
      where: { id },
      data: { status: status as any },
    });
  }
}
