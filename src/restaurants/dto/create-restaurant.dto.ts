import { IsString, IsEmail, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum RestaurantStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

enum SubscriptionPlan {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  ENTERPRISE = 'ENTERPRISE',
}

export class CreateRestaurantDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  country: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({ enum: RestaurantStatus, default: RestaurantStatus.ACTIVE })
  @IsOptional()
  @IsEnum(RestaurantStatus)
  status?: RestaurantStatus;

  @ApiPropertyOptional({ enum: SubscriptionPlan, default: SubscriptionPlan.FREE })
  @IsOptional()
  @IsEnum(SubscriptionPlan)
  subscriptionPlan?: SubscriptionPlan;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  subscriptionEndDate?: Date;

  // Admin user fields
  @ApiProperty()
  @IsString()
  adminFirstName: string;

  @ApiProperty()
  @IsString()
  adminLastName: string;

  @ApiProperty()
  @IsEmail()
  adminEmail: string;

  @ApiProperty()
  @IsString()
  adminPhone: string;

  @ApiProperty()
  @IsString()
  adminPassword: string;
}
