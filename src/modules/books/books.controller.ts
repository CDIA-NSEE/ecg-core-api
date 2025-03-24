import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { BookFacadeService } from './services/book.facade.service';
import { PaginationDto } from '../../shared/common/dto/pagination.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BookResponseEntity, BooksPageResponseEntity } from './entities';

@ApiTags('Books')
@Controller('books')
export class BooksController {
  constructor(private readonly bookFacade: BookFacadeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new book' })
  @ApiResponse({ 
    status: 201, 
    description: 'The book has been successfully created.',
    type: BookResponseEntity
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async create(@Body() createBookDto: CreateBookDto): Promise<BookResponseEntity> {
    return this.bookFacade.create(createBookDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all books' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all books.',
    type: [BookResponseEntity]
  })
  async findAll(@Query() pagination: PaginationDto): Promise<BookResponseEntity[] | BooksPageResponseEntity> {
    if (pagination.page || pagination.limit) {
      return this.bookFacade.findWithPagination(pagination);
    }
    return this.bookFacade.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a book by id' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return the book.',
    type: BookResponseEntity
  })
  @ApiResponse({ status: 404, description: 'Book not found.' })
  async findOne(@Param('id') id: string): Promise<BookResponseEntity> {
    return this.bookFacade.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a book' })
  @ApiResponse({ 
    status: 200, 
    description: 'The book has been successfully updated.',
    type: BookResponseEntity
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Book not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<BookResponseEntity> {
    return this.bookFacade.update(id, updateBookDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a book' })
  @ApiResponse({ 
    status: 200, 
    description: 'The book has been successfully soft deleted.',
    type: BookResponseEntity
  })
  @ApiResponse({ status: 404, description: 'Book not found.' })
  async delete(@Param('id') id: string): Promise<BookResponseEntity> {
    return this.bookFacade.delete(id);
  }

  @Delete(':id/hard')
  @ApiOperation({ summary: 'Hard delete a book' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'The book has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Book not found.' })
  async hardDelete(@Param('id') id: string): Promise<BookResponseEntity> {
    return this.bookFacade.hardDelete(id);
  }
}
