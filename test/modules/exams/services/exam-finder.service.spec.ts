import { Test, TestingModule } from '@nestjs/testing';
import { ExamFinderService } from '../../../../src/modules/exams/services/exam-finder.service';
import { ExamRepository } from '../../../../src/modules/exams/repositories';
import { LoggerService } from '../../../../src/shared/common/services/logger.service';
import { ExamDocument } from '../../../../src/modules/exams/schemas/exam.schema';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

describe('ExamFinderService', () => {
  let service: ExamFinderService;
  let examRepository: ExamRepository;
  let loggerService: LoggerService;

  // Mock exam document
  const mockExamId = new Types.ObjectId('60d21b4667d0d8992e610c85');
  const mockExamDocument = {
    _id: mockExamId,
    examDate: new Date(),
    report: 'Test report',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Partial<ExamDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamFinderService,
        {
          provide: ExamRepository,
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockExamDocument),
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

    service = module.get<ExamFinderService>(ExamFinderService);
    examRepository = module.get<ExamRepository>(ExamRepository);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should find an exam by id successfully', async () => {
      const id = mockExamId.toString();

      const result = await service.findOne(id);

      expect(examRepository.findOne).toHaveBeenCalledWith({ _id: id });
      expect(result).toEqual(mockExamDocument);
      expect(loggerService.logOperation).toHaveBeenCalled();
    });

    it('should throw NotFoundException if exam is not found', async () => {
      const id = 'non-existent-id';

      jest.spyOn(examRepository, 'findOne').mockResolvedValueOnce(null as unknown as ExamDocument);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      expect(loggerService.logError).toHaveBeenCalled();
    });

    it('should handle errors during findOne operation', async () => {
      const id = mockExamId.toString();

      jest.spyOn(examRepository, 'findOne').mockRejectedValueOnce(new Error('Database error'));

      await expect(service.findOne(id)).rejects.toThrow('Error finding Exam');
      expect(loggerService.logError).toHaveBeenCalled();
    });
  });
});
