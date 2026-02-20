import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, IsBoolean, IsArray, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum Category {
  FOOD = 'FOOD',
  DRINK = 'DRINK',
  DESSERT = 'DESSERT',
}

export class CreateMenuItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ enum: Category })
  @IsEnum(Category)
  category: Category;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @ApiProperty({ default: 15 })
  @IsNumber()
  @IsOptional()
  preparationTime?: number;

  @ApiProperty({ default: 4.5 })
  @IsNumber()
  @IsOptional()
  rating?: number;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsOptional()
  isPopular?: boolean;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  alcoholContent?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  calories?: number;

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allergens?: string[];
}
