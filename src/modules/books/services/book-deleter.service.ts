import { Injectable } from '@nestjs/common';
import { BookDocument } from '../schemas/book.schema';
import { BookRepository } from '../repositories/book.repository';
import { AbstractDeleterService } from '../../../shared/common/services/abstract.deleter.service';
import { LoggerService } from '../../../shared/common/services/logger.service';

@Injectable()
export class BookDeleterService extends AbstractDeleterService<BookDocument> {
  constructor(
    private readonly bookRepository: BookRepository,
    logger: LoggerService,
  ) {
    super(bookRepository, logger, 'Book');
  }
}
