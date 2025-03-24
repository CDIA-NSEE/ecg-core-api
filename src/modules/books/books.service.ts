import { Injectable } from '@nestjs/common';
import { Book } from './schemas/book.schema';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BookRepository } from './repositories/book.repository';

@Injectable()
export class BooksService {
  constructor(private readonly bookRepository: BookRepository) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    return this.bookRepository.create(createBookDto);
  }

  async findAll(): Promise<Book[]> {
    return this.bookRepository.findAll();
  }

  async findOne(id: string): Promise<Book> {
    return this.bookRepository.findById(id);
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    return this.bookRepository.update(id, updateBookDto);
  }

  async remove(id: string): Promise<void> {
    await this.bookRepository.delete(id);
  }
}
