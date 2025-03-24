import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateBookDto {
  @ApiProperty({ description: 'The title of the book', example: 'The Great Gatsby' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'The author of the book', example: 'F. Scott Fitzgerald' })
  @IsString()
  @IsNotEmpty()
  author: string;

  @ApiProperty({ description: 'The publication year of the book', minimum: 1000, example: 1925, required: false })
  @IsNumber()
  @Min(1000)
  @IsOptional()
  year?: number;

  @ApiProperty({ description: 'The description of the book', required: false, example: 'A novel about the American Dream' })
  @IsString()
  @IsOptional()
  description?: string;
}
