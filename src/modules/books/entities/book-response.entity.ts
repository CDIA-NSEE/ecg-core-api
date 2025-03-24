import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../shared/common/entities/base.entity';
import { BookDocument } from '../schemas/book.schema';

export class BookResponseEntity extends BaseEntity {
  @ApiProperty({ description: 'The unique identifier of the book' })
  id: string;

  @ApiProperty({ description: 'The title of the book' })
  title: string;

  @ApiProperty({ description: 'The author of the book' })
  author: string;

  @ApiProperty({ description: 'The publication year of the book', required: false })
  year?: number;

  @ApiProperty({ description: 'The description of the book', required: false })
  description?: string;

  @ApiProperty({ description: 'Whether the book is deleted (soft delete)' })
  isDeleted: boolean;

  @ApiProperty({ description: 'The creation date of the book' })
  createdAt: Date;

  @ApiProperty({ description: 'The last update date of the book' })
  updatedAt: Date;

  constructor(partial?: Partial<BookResponseEntity>) {
    super(partial);
    if (partial) {
      Object.assign(this, partial);
    }
  }

  static fromEntity(book: BookDocument): BookResponseEntity {
    return new BookResponseEntity({
      id: book._id.toString(),
      title: book.title,
      author: book.author,
      year: book.year,
      description: book.description,
      isDeleted: book.isDeleted,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
    });
  }

  static fromEntities(books: BookDocument[]): BookResponseEntity[] {
    return books.map(book => BookResponseEntity.fromEntity(book));
  }
}
