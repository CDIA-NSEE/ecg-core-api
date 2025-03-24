import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../shared/common/dto';

export class FindBookDto extends PaginationDto {
  @ApiProperty({ description: 'Filter by book title', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Filter by book author', required: false })
  @IsString()
  @IsOptional()
  author?: string;
}
