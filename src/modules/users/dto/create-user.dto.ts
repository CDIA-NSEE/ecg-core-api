import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'The username of the user', example: 'john_doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The email of the user', example: 'john.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'The password of the user', example: 'secure_password123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'The CRM of the user', example: '123456', required: false })
  @IsString()
  @IsOptional()
  crm?: string;
}