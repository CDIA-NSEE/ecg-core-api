import { Injectable } from '@nestjs/common';
import { BookDocument } from '../schemas/book.schema';
import { BookRepository } from '../repositories/book.repository';
import { AbstractFinderService } from '../../../shared/common/services/abstract.finder.service';
import { LoggerService } from '../../../shared/common/services/logger.service';
import { CacheService } from '../../../shared/cache';
import { ConfigService } from '../../../shared/config';
import { Cached } from '../../../shared/cache/decorators/cached.decorator';
import { FilterQuery } from 'mongoose';

@Injectable()
export class BookFinderService extends AbstractFinderService<BookDocument> {
  constructor(
    private readonly bookRepository: BookRepository,
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService,
    logger: LoggerService,
  ) {
    super(bookRepository, logger, 'Book');
  }

  @Cached('books')
  async findOne(id: string): Promise<BookDocument> {
    return super.findOne(id);
  }

  @Cached('books')
  async findAll(filter?: FilterQuery<BookDocument>): Promise<BookDocument[]> {
    try {
      this.logger.logOperation('findAll', 'Book', { filter });
      return await this.repository.findAll(filter);
    } catch (error) {
      this.logger.logError('findAll', 'Book', error);
      throw error;
    }
  }

  @Cached('books')
  async findByFilter(conditions: FilterQuery<BookDocument>): Promise<BookDocument | null> {
    try {
      this.logger.logOperation('findByFilter', 'Book', { conditions });
      const result = await this.repository.findAll(conditions);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      this.logger.logError('findByFilter', 'Book', error);
      throw error;
    }
  }
}
