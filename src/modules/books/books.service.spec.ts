import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { getModelToken } from '@nestjs/mongoose';
import { Book } from './schemas/book.schema';
import { Model } from 'mongoose';

describe('BooksService', () => {
  let service: BooksService;
  let model: Model<Book>;

  const mockBook = {
    title: 'Test Book',
    author: 'Test Author',
    price: 29.99,
    description: 'Test Description',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getModelToken(Book.name),
          useValue: {
            new: jest.fn().mockResolvedValue(mockBook),
            constructor: jest.fn().mockResolvedValue(mockBook),
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    model = module.get<Model<Book>>(getModelToken(Book.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new book', async () => {
      jest.spyOn(model, 'save').mockResolvedValueOnce(mockBook as any);
      
      const result = await service.create(mockBook);
      expect(result).toEqual(mockBook);
    });
  });

  describe('findAll', () => {
    it('should return an array of books', async () => {
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce([mockBook]),
      } as any);
      
      const result = await service.findAll();
      expect(result).toEqual([mockBook]);
    });
  });
});
