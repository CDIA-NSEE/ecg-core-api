import { Injectable } from '@nestjs/common';
import { BookDocument } from '../schemas/book.schema';
import { BookRepository } from '../repositories/book.repository';
import { AbstractUpdaterService } from '../../../shared/common/services/abstract.updater.service';
import { LoggerService } from '../../../shared/common/services/logger.service';
import { UpdateBookDto } from '../dto/update-book.dto';

@Injectable()
export class BookUpdaterService extends AbstractUpdaterService<BookDocument, UpdateBookDto> {
  constructor(
    private readonly bookRepository: BookRepository,
    logger: LoggerService,
  ) {
    super(bookRepository, logger, 'Book');
  }
}
