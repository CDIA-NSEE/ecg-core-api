import { Test, TestingModule } from '@nestjs/testing';
import { ExamUpdaterService } from '../../../../src/modules/exams/services/exam-updater.service';
import { ExamRepository } from '../../../../src/modules/exams/repositories';
import { LoggerService } from '../../../../src/shared/common/services/logger.service';
import { ExamDocument } from '../../../../src/modules/exams/schemas/exam.schema';
import { UpdateExamDto } from '../../../../src/modules/exams/dto/update-exam.dto';
import { InternalServerErrorException } from '@nestjs/common';
import { Types } from 'mongoose';

describe('ExamUpdaterService', () => {
  let service: ExamUpdaterService;
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

  // Mock updated exam document
  const mockUpdatedExamDocument = {
    ...mockExamDocument,
    report: 'Updated report',
  } as Partial<ExamDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamUpdaterService,
        {
          provide: ExamRepository,
          useValue: {
            update: jest.fn().mockResolvedValue(mockUpdatedExamDocument),
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
            logSuccess: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ExamUpdaterService>(ExamUpdaterService);
    examRepository = module.get<ExamRepository>(ExamRepository);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('update', () => {
    it('should update an exam successfully', async () => {
      const id = mockExamId.toString();
      const updateExamDto: UpdateExamDto = {
        report: 'Updated report',
      };

      const result = await service.update(id, updateExamDto);

      expect(examRepository.update).toHaveBeenCalledWith(id, updateExamDto);
      expect(result).toEqual(mockUpdatedExamDocument);
      expect(loggerService.logOperation).toHaveBeenCalled();
      expect(loggerService.logSuccess).toHaveBeenCalled();
    });

    it('should handle errors during update operation', async () => {
      const id = mockExamId.toString();
      const updateExamDto: UpdateExamDto = {
        report: 'Updated report',
      };

      jest.spyOn(examRepository, 'update').mockRejectedValueOnce(new Error('Database error'));

      await expect(service.update(id, updateExamDto)).rejects.toThrow(InternalServerErrorException);
      expect(loggerService.logError).toHaveBeenCalled();
    });
  });
});
