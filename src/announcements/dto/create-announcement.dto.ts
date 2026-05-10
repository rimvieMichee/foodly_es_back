import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsInt, IsDateString } from 'class-validator';

export class CreateAnnouncementDto {
  @ApiProperty()
  @IsString()
  restaurantId: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  imageUrl: string;

  @ApiProperty({ required: false, default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  link?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  validFrom?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  validUntil?: string;

  @ApiProperty({ required: false, default: 0 })
  @IsInt()
  @IsOptional()
  displayOrder?: number;
}
