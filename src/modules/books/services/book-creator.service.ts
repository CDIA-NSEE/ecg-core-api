import { Injectable } from '@nestjs/common';
import { BookDocument } from '../schemas/book.schema';
import { BookRepository } from '../repositories/book.repository';
import { AbstractCreatorService } from '../../../shared/common/services/abstract.creator.service';
import { LoggerService } from '../../../shared/common/services/logger.service';
import { CreateBookDto } from '../dto/create-book.dto';

@Injectable()
export class BookCreatorService extends AbstractCreatorService<BookDocument, CreateBookDto> {
  constructor(
    private readonly bookRepository: BookRepository,
    logger: LoggerService,
  ) {
    super(bookRepository, logger, 'Book');
  }
}
