import { Test, TestingModule } from '@nestjs/testing';
import { ExamIndexerService } from '../../../../src/modules/exams/services/exam-indexer.service';
import { ExamRepository } from '../../../../src/modules/exams/repositories';
import { LoggerService } from '../../../../src/shared/common/services/logger.service';
import { ExamDocument } from '../../../../src/modules/exams/schemas/exam.schema';
import { PaginationDto } from '../../../../src/shared/common/dto/pagination.dto';
import { InternalServerErrorException } from '@nestjs/common';
import mongoose from 'mongoose';

describe('ExamIndexerService', () => {
  let service: ExamIndexerService;
  let examRepository: ExamRepository;
  let loggerService: LoggerService;

  // Mock exam document
  const mockExamDocument = {
    _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c85'),
    examDate: new Date(),
    report: 'Test report',
    title: 'Exam Title',
    description: 'Exam Description',
    status: 'pending',
    categories: ['NORMAL', 'SINUS_RHYTHM'],
    amplitude: 1.5,
    velocity: 25,
    dateOfBirth: new Date('1980-01-01'),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as ExamDocument;

  // Mock pagination metadata
  const mockPaginationMeta = {
    total: 1,
    page: 1,
    limit: 10,
    lastPage: 1,
    hasNextPage: false,
    hasPreviousPage: false
  };

  // Mock paginated response
  const mockPaginatedResponse = {
    items: [mockExamDocument],
    meta: mockPaginationMeta
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamIndexerService,
        {
          provide: ExamRepository,
          useValue: {
            find: jest.fn().mockResolvedValue([mockExamDocument]),
            findWithPagination: jest.fn().mockResolvedValue(mockPaginatedResponse),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            logOperation: jest.fn(),
            logError: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ExamIndexerService>(ExamIndexerService);
    examRepository = module.get<ExamRepository>(ExamRepository);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should find all exams with filter', async () => {
      const filter = { status: 'pending' };

      const result = await service.findAll(filter);

      expect(examRepository.findWithPagination).toHaveBeenCalledWith(filter);
      expect(result).toEqual([mockExamDocument]);
      expect(loggerService.logOperation).toHaveBeenCalled();
    });

    it('should handle errors during findAll operation', async () => {
      const filter = { status: 'pending' };

      jest.spyOn(examRepository, 'findWithPagination').mockRejectedValueOnce(new Error('Database error'));

      await expect(service.findAll(filter)).rejects.toThrow(Error);
      expect(loggerService.logError).toHaveBeenCalled();
    });
  });

  describe('findWithPagination', () => {
    it('should find exams with pagination and no filters', async () => {
      const pagination: PaginationDto = { page: 1, limit: 10 };

      const result = await service.findWithPagination(pagination);

      expect(examRepository.findWithPagination).toHaveBeenCalledWith(
        pagination,
        expect.any(Object)
      );
      expect(result).toEqual(mockPaginatedResponse);
      expect(loggerService.logOperation).toHaveBeenCalled();
    });

    it('should find exams with pagination and search filter', async () => {
      const pagination: PaginationDto = { page: 1, limit: 10 };
      const filter = { search: 'test' };

      const result = await service.findWithPagination(pagination, filter);

      expect(examRepository.findWithPagination).toHaveBeenCalledWith(
        pagination,
        expect.objectContaining({
          $or: expect.arrayContaining([
            { title: { $regex: 'test', $options: 'i' } },
            { description: { $regex: 'test', $options: 'i' } },
            { report: { $regex: 'test', $options: 'i' } }
          ])
        })
      );
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should find exams with pagination and status filter', async () => {
      const pagination: PaginationDto = { page: 1, limit: 10 };
      const filter = { status: 'pending' };

      const result = await service.findWithPagination(pagination, filter);

      expect(examRepository.findWithPagination).toHaveBeenCalledWith(
        pagination,
        expect.objectContaining({
          $and: expect.arrayContaining([
            { status: 'pending' }
          ])
        })
      );
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should find exams with pagination and user/patient filters', async () => {
      const pagination: PaginationDto = { page: 1, limit: 10 };
      const filter = { 
        userId: 'user123',
        patientId: 'patient456'
      };

      const result = await service.findWithPagination(pagination, filter);

      expect(examRepository.findWithPagination).toHaveBeenCalledWith(
        pagination,
        expect.objectContaining({
          $and: expect.arrayContaining([
            { userId: 'user123' },
            { patientId: 'patient456' }
          ])
        })
      );
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should find exams with pagination and date of birth range', async () => {
      const pagination: PaginationDto = { page: 1, limit: 10 };
      const filter = { 
        dateOfBirthFrom: '1970-01-01',
        dateOfBirthTo: '1990-01-01'
      };

      const result = await service.findWithPagination(pagination, filter);

      expect(examRepository.findWithPagination).toHaveBeenCalledWith(
        pagination,
        expect.objectContaining({
          $and: expect.arrayContaining([
            { 
              dateOfBirth: {
                $gte: expect.any(Date),
                $lte: expect.any(Date)
              }
            }
          ])
        })
      );
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should find exams with pagination and amplitude/velocity ranges', async () => {
      const pagination: PaginationDto = { page: 1, limit: 10 };
      const filter = { 
        minAmplitude: 1.0,
        maxAmplitude: 2.0,
        minVelocity: 20,
        maxVelocity: 30
      };

      const result = await service.findWithPagination(pagination, filter);

      expect(examRepository.findWithPagination).toHaveBeenCalledWith(
        pagination,
        expect.objectContaining({
          $and: expect.arrayContaining([
            { 
              amplitude: {
                $gte: 1.0,
                $lte: 2.0
              }
            },
            {
              velocity: {
                $gte: 20,
                $lte: 30
              }
            }
          ])
        })
      );
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should find exams with pagination and categories filter', async () => {
      const pagination: PaginationDto = { page: 1, limit: 10 };
      const filter = { 
        categories: ['NORMAL', 'SINUS_RHYTHM']
      };

      const result = await service.findWithPagination(pagination, filter);

      expect(examRepository.findWithPagination).toHaveBeenCalledWith(
        pagination,
        expect.objectContaining({
          $and: expect.arrayContaining([
            { 
              categories: {
                $in: ['NORMAL', 'SINUS_RHYTHM']
              }
            }
          ])
        })
      );
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should handle errors during findWithPagination operation', async () => {
      const pagination: PaginationDto = { page: 1, limit: 10 };

      jest.spyOn(examRepository, 'findWithPagination').mockRejectedValueOnce(new Error('Database error'));

      await expect(service.findWithPagination(pagination)).rejects.toThrow(InternalServerErrorException);
      expect(loggerService.logError).toHaveBeenCalled();
    });
  });
});
