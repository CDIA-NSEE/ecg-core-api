import { Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { BookDocument } from '../schemas/book.schema';
import { CreateBookDto } from '../dto/create-book.dto';
import { UpdateBookDto } from '../dto/update-book.dto';
import { BookCreatorService } from './book-creator.service';
import { BookFinderService } from './book-finder.service';
import { BookUpdaterService } from './book-updater.service';
import { BookDeleterService } from './book-deleter.service';
import { BookIndexerService } from './book-indexer.service';
import { PaginationDto } from '../../../shared/common/dto/pagination.dto';
import { BookResponseEntity, BooksPageResponseEntity } from '../entities';

@Injectable()
export class BookFacadeService {
  constructor(
    private readonly creatorService: BookCreatorService,
    private readonly finderService: BookFinderService,
    private readonly updaterService: BookUpdaterService,
    private readonly deleterService: BookDeleterService,
    private readonly indexerService: BookIndexerService,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<BookResponseEntity> {
    const book = await this.creatorService.create(createBookDto);
    return BookResponseEntity.fromEntity(book);
  }

  async findAll(filter?: FilterQuery<BookDocument>): Promise<BookResponseEntity[]> {
    const books = await this.indexerService.findAll(filter);
    return BookResponseEntity.fromEntities(books);
  }

  async findWithPagination(
    pagination: PaginationDto,
    filter?: FilterQuery<BookDocument>,
  ): Promise<BooksPageResponseEntity> {
    const { items, total, page, limit } = await this.indexerService.findWithPagination(
      pagination,
      filter,
    );
    
    const bookEntities = BookResponseEntity.fromEntities(items);
    return new BooksPageResponseEntity(bookEntities, total, page, limit);
  }

  async findOne(id: string): Promise<BookResponseEntity> {
    const book = await this.finderService.findOne(id);
    return BookResponseEntity.fromEntity(book);
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<BookResponseEntity> {
    const book = await this.updaterService.update(id, updateBookDto);
    return BookResponseEntity.fromEntity(book);
  }

  async delete(id: string): Promise<BookResponseEntity> {
    const book = await this.deleterService.delete(id);
    return BookResponseEntity.fromEntity(book);
  }

  async hardDelete(id: string): Promise<BookResponseEntity> {
    const book = await this.deleterService.hardDelete(id);
    return BookResponseEntity.fromEntity(book);
  }
}
