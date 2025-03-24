import { Injectable } from '@nestjs/common';
import { BookDocument } from '../schemas/book.schema';
import { BookRepository } from '../repositories/book.repository';
import { AbstractIndexerService } from '../../../shared/common/services/abstract.indexer.service';
import { LoggerService } from '../../../shared/common/services/logger.service';

@Injectable()
export class BookIndexerService extends AbstractIndexerService<BookDocument> {
  constructor(
    private readonly bookRepository: BookRepository,
    logger: LoggerService,
  ) {
    super(bookRepository, logger, 'Book');
  }
}
