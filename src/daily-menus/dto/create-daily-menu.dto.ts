import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, IsBoolean, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDailyMenuDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  restaurantId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  originalPrice: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  discountedPrice: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent: number;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  menuItemIds: string[];

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  validFrom?: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  validUntil: string;
}
