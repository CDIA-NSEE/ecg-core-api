import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ description: 'Total number of items' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  lastPage: number;

  @ApiProperty({ description: 'Whether there is a next page' })
  hasNextPage: boolean;

  @ApiProperty({ description: 'Whether there is a previous page' })
  hasPreviousPage: boolean;
}

export class PaginationDto {
  @ApiProperty({ description: 'Page number', minimum: 1, default: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Number of items per page', minimum: 1, default: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'List of items in the current page', isArray: true })
  data: T[];

  @ApiProperty({ description: 'Pagination metadata', type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
