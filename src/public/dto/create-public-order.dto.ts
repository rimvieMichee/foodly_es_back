import { IsString, IsNumber, IsArray, IsOptional, IsNotEmpty, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PublicOrderItemDto {
  @IsString()
  @IsNotEmpty()
  menuItemId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class CreatePublicOrderDto {
  @IsString()
  @IsNotEmpty()
  restaurantId: string;

  @IsString()
  @IsNotEmpty()
  tableId: string;

  @IsString()
  @IsNotEmpty()
  tableNumber: string;

  @IsString()
  @IsNotEmpty()
  clientName: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PublicOrderItemDto)
  items: PublicOrderItemDto[];

  @IsNumber()
  @Min(0)
  totalAmount: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  clientFcmToken?: string;
}
