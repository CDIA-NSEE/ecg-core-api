import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BooksController } from './books.controller';
import { Book, BookSchema } from './schemas/book.schema';
import { BookRepository } from './repositories/book.repository';
import { BookCreatorService } from './services/book-creator.service';
import { BookFinderService } from './services/book-finder.service';
import { BookUpdaterService } from './services/book-updater.service';
import { BookDeleterService } from './services/book-deleter.service';
import { BookIndexerService } from './services/book-indexer.service';
import { BookFacadeService } from './services/book.facade.service';
import { LoggerService } from '../../shared/common/services/logger.service';
import { RedisCacheModule } from '../../shared/cache';
import { ConfigModule } from '../../shared/config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }]),
    RedisCacheModule,
    ConfigModule,
  ],
  controllers: [BooksController],
  providers: [
    BookRepository,
    LoggerService,
    BookCreatorService,
    BookFinderService,
    BookUpdaterService,
    BookDeleterService,
    BookIndexerService,
    BookFacadeService,
  ],
})
export class BooksModule {}
