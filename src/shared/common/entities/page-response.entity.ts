import { ApiProperty } from '@nestjs/swagger';

export class PageResponseEntity<T> {
  @ApiProperty({ description: 'The items in the current page' })
  items: T[];

  @ApiProperty({ description: 'The total number of items' })
  total: number;

  @ApiProperty({ description: 'The current page number' })
  page: number;

  @ApiProperty({ description: 'The number of items per page' })
  limit: number;

  @ApiProperty({ description: 'The total number of pages' })
  totalPages: number;

  constructor(items: T[], total: number, page: number, limit: number) {
    this.items = items;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
  }
}
