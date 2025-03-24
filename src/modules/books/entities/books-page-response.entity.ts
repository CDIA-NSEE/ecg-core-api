import { ApiProperty } from '@nestjs/swagger';
import { PageResponseEntity } from '../../../shared/common/entities/page-response.entity';
import { BookResponseEntity } from './book-response.entity';

export class BooksPageResponseEntity extends PageResponseEntity<BookResponseEntity> {
  @ApiProperty({ type: [BookResponseEntity] })
  items: BookResponseEntity[];

  constructor(
    items: BookResponseEntity[],
    total: number,
    page: number,
    limit: number,
  ) {
    super(items, total, page, limit);
  }
}
