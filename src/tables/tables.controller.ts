import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('tables')
@Controller('tables')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new table' })
  create(@Body() createTableDto: CreateTableDto) {
    return this.tablesService.create(createTableDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tables' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'restaurantId', required: false })
  findAll(
    @Query('status') status?: string,
    @Query('restaurantId') restaurantId?: string,
  ) {
    return this.tablesService.findAll(status, restaurantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get table by ID' })
  findOne(@Param('id') id: string) {
    return this.tablesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update table' })
  update(@Param('id') id: string, @Body() updateTableDto: UpdateTableDto) {
    return this.tablesService.update(id, updateTableDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update table status' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.tablesService.updateStatus(id, status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete table' })
  remove(@Param('id') id: string) {
    return this.tablesService.remove(id);
  }
}
