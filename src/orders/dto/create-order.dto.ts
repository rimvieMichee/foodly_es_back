import { IsString, IsNotEmpty, IsNumber, IsArray, IsOptional, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  menuItemId: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  comment?: string;
}

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  restaurantId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tableId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tableNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  serverId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  serverName: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty()
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
