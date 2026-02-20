import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum Role {
  ADMIN = 'ADMIN',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
}

export class RegisterDto {
  @ApiProperty({ example: 'server@foodly.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Jean' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Dupont' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '+237690123456' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ enum: Role, default: Role.SERVER })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
