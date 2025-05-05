import { Test, TestingModule } from '@nestjs/testing';
import { ExamDeleterService } from '../../../../src/modules/exams/services/exam-deleter.service';
import { ExamRepository } from '../../../../src/modules/exams/repositories';
import { LoggerService } from '../../../../src/shared/common/services/logger.service';
import { ExamDocument } from '../../../../src/modules/exams/schemas/exam.schema';
import { NotFoundException } from '@nestjs/common';
import mongoose, { Types } from 'mongoose';

describe('ExamDeleterService', () => {
  let service: ExamDeleterService;
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

  // Mock deleted exam document (soft delete)
  const mockDeletedExamDocument = {
    ...mockExamDocument,
    deletedAt: new Date(),
  } as Partial<ExamDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamDeleterService,
        {
          provide: ExamRepository,
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockExamDocument),
            delete: jest.fn().mockResolvedValue(mockDeletedExamDocument),
            hardDelete: jest.fn().mockResolvedValue(mockExamDocument),
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

    service = module.get<ExamDeleterService>(ExamDeleterService);
    examRepository = module.get<ExamRepository>(ExamRepository);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('delete', () => {
    it('should soft delete an exam successfully', async () => {
      const id = mockExamId.toString();

      const result = await service.delete(id);

      expect(examRepository.findOne).toHaveBeenCalledWith(id);
      expect(examRepository.delete).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockExamDocument);
      expect(loggerService.logOperation).toHaveBeenCalled();
    });

    it('should throw NotFoundException if exam to delete is not found', async () => {
      const id = 'non-existent-id';

      jest.spyOn(examRepository, 'findOne').mockResolvedValueOnce(null as unknown as ExamDocument);

      await expect(service.delete(id)).rejects.toThrow(NotFoundException);
      expect(loggerService.logError).toHaveBeenCalled();
    });

    it('should handle errors during delete operation', async () => {
      const id = mockExamId.toString();

      jest.spyOn(examRepository, 'delete').mockRejectedValueOnce(new Error('Database error'));

      await expect(service.delete(id)).rejects.toThrow('Error deleting Exam');
      expect(loggerService.logError).toHaveBeenCalled();
    });
  });

  describe('hardDelete', () => {
    it('should hard delete an exam successfully', async () => {
      const id = mockExamId.toString();

      const result = await service.hardDelete(id);

      expect(examRepository.findOne).toHaveBeenCalledWith(id);
      expect(examRepository.hardDelete).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockExamDocument);
      expect(loggerService.logOperation).toHaveBeenCalled();
    });

    it('should throw NotFoundException if exam to hard delete is not found', async () => {
      const id = 'non-existent-id';

      jest.spyOn(examRepository, 'findOne').mockResolvedValueOnce(null as unknown as ExamDocument);

      await expect(service.hardDelete(id)).rejects.toThrow(NotFoundException);
      expect(loggerService.logError).toHaveBeenCalled();
    });

    it('should handle errors during hard delete operation', async () => {
      const id = mockExamId.toString();

      jest.spyOn(examRepository, 'hardDelete').mockRejectedValueOnce(new Error('Database error'));

      await expect(service.hardDelete(id)).rejects.toThrow('Error permanently deleting Exam');
      expect(loggerService.logError).toHaveBeenCalled();
    });
  });
});
