import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book, BookDocument } from '../schemas/book.schema';
import { AbstractRepository } from '../../../shared/common/repositories/abstract.repository';

@Injectable()
export class BookRepository extends AbstractRepository<BookDocument> {
  constructor(
    @InjectModel(Book.name) private readonly bookModel: Model<BookDocument>,
  ) {
    super(bookModel);
  }
}
