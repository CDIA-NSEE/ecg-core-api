import { Test, TestingModule } from '@nestjs/testing';
import { ExamRepository } from '../../../../src/modules/exams/repositories/exam.repository';
import { getModelToken } from '@nestjs/mongoose';
import { Exam, ExamDocument } from '../../../../src/modules/exams/schemas/exam.schema';
import { Model } from 'mongoose';
import { CreateExamDto } from '../../../../src/modules/exams/dto/create-exam.dto';
import { UpdateExamDto } from '../../../../src/modules/exams/dto/update-exam.dto';
import { PaginationDto } from '../../../../src/shared/common/dto/pagination.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { RepositoryException } from '../../../../src/shared/common/repositories/abstract.repository';
import mongoose from 'mongoose';

describe('ExamRepository', () => {
  let repository: ExamRepository;
  let examModel: Model<ExamDocument>;

  // Mock exam document
  const mockExamId = new mongoose.Types.ObjectId('60d21b4667d0d8992e610c85');
  const mockExamDocument = {
    _id: mockExamId,
    examDate: new Date(),
    report: 'Test report',
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn().mockResolvedValue(this),
    toObject: jest.fn().mockReturnValue({
      _id: mockExamId,
      examDate: new Date(),
      report: 'Test report',
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  } as unknown as ExamDocument;

  // Mock updated exam document
  const mockUpdatedExamDocument = {
    ...mockExamDocument,
    report: 'Updated report',
  } as unknown as ExamDocument;

  // Mock deleted exam document (soft delete)
  const mockDeletedExamDocument = {
    ...mockExamDocument,
    deletedAt: new Date(),
    isDeleted: true,
  } as unknown as ExamDocument;

  // Mock pagination result
  const mockPaginationResult = {
    data: [mockExamDocument],
    meta: {
      total: 1,
      page: 1,
      limit: 10,
      lastPage: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamRepository,
        {
          provide: getModelToken(Exam.name),
          useValue: {
            new: jest.fn().mockResolvedValue(mockExamDocument),
            constructor: jest.fn().mockResolvedValue(mockExamDocument),
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            findOneAndUpdate: jest.fn(),
            countDocuments: jest.fn(),
            exec: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<ExamRepository>(ExamRepository);
    examModel = module.get<Model<ExamDocument>>(getModelToken(Exam.name));
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create an exam successfully', async () => {
      const createExamDto: CreateExamDto = {
        examDate: new Date(),
        report: 'Test report',
      };

      jest.spyOn(examModel, 'create').mockImplementationOnce(() => 
        Promise.resolve(mockExamDocument) as any
      );

      const result = await repository.create(createExamDto);

      expect(result).toEqual(mockExamDocument);
    });

    it('should handle validation errors during create', async () => {
      const createExamDto: CreateExamDto = {
        examDate: new Date(),
        report: 'Test report',
      };

      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';

      jest.spyOn(examModel, 'create').mockRejectedValueOnce(validationError);

      await expect(repository.create(createExamDto)).rejects.toThrow(BadRequestException);
    });

    it('should handle other errors during create', async () => {
      const createExamDto: CreateExamDto = {
        examDate: new Date(),
        report: 'Test report',
      };

      jest.spyOn(examModel, 'create').mockRejectedValueOnce(new Error('Database error'));

      await expect(repository.create(createExamDto)).rejects.toThrow(RepositoryException);
    });
  });

  describe('findOne', () => {
    it('should find an exam by id successfully', async () => {
      const id = mockExamId.toString();

      jest.spyOn(examModel, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockExamDocument),
      } as any);

      const result = await repository.findOne(id);

      expect(examModel.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockExamDocument);
    });

    it('should throw NotFoundException if exam is not found', async () => {
      const id = 'non-existent-id';

      jest.spyOn(examModel, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(repository.findOne(id)).rejects.toThrow(NotFoundException);
    });

    it('should handle errors during findOne operation', async () => {
      const id = mockExamId.toString();

      jest.spyOn(examModel, 'findById').mockReturnValueOnce({
        exec: jest.fn().mockRejectedValueOnce(new Error('Database error')),
      } as any);

      await expect(repository.findOne(id)).rejects.toThrow(RepositoryException);
    });
  });

  describe('findAll', () => {
    it('should find all exams with filter', async () => {
      const filter = { status: 'pending' };

      jest.spyOn(examModel, 'find').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce([mockExamDocument]),
      } as any);

      const result = await repository.findAll(filter);

      expect(examModel.find).toHaveBeenCalledWith({ ...filter, isDeleted: false });
      expect(result).toEqual([mockExamDocument]);
    });

    it('should handle errors during findAll operation', async () => {
      const filter = { status: 'pending' };

      jest.spyOn(examModel, 'find').mockReturnValueOnce({
        exec: jest.fn().mockRejectedValueOnce(new Error('Database error')),
      } as any);

      await expect(repository.findAll(filter)).rejects.toThrow(RepositoryException);
    });
  });

  describe('update', () => {
    it('should update an exam successfully', async () => {
      const id = mockExamId.toString();
      const updateExamDto: UpdateExamDto = {
        report: 'Updated report',
      };

      jest.spyOn(examModel, 'findOneAndUpdate').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockUpdatedExamDocument),
      } as any);

      const result = await repository.update(id, updateExamDto);

      expect(examModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: id, isDeleted: false },
        updateExamDto,
        { new: true }
      );
      expect(result).toEqual(mockUpdatedExamDocument);
    });

    it('should throw NotFoundException if exam to update is not found', async () => {
      const id = 'non-existent-id';
      const updateExamDto: UpdateExamDto = {
        report: 'Updated report',
      };

      jest.spyOn(examModel, 'findOneAndUpdate').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(repository.update(id, updateExamDto)).rejects.toThrow(NotFoundException);
    });

    it('should handle validation errors during update', async () => {
      const id = mockExamId.toString();
      const updateExamDto: UpdateExamDto = {
        report: 'Updated report',
      };

      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';

      jest.spyOn(examModel, 'findOneAndUpdate').mockReturnValueOnce({
        exec: jest.fn().mockRejectedValueOnce(validationError),
      } as any);

      await expect(repository.update(id, updateExamDto)).rejects.toThrow(BadRequestException);
    });

    it('should handle other errors during update', async () => {
      const id = mockExamId.toString();
      const updateExamDto: UpdateExamDto = {
        report: 'Updated report',
      };

      jest.spyOn(examModel, 'findOneAndUpdate').mockReturnValueOnce({
        exec: jest.fn().mockRejectedValueOnce(new Error('Database error')),
      } as any);

      await expect(repository.update(id, updateExamDto)).rejects.toThrow(RepositoryException);
    });
  });

  describe('delete', () => {
    it('should soft delete an exam successfully', async () => {
      const id = mockExamId.toString();

      jest.spyOn(examModel, 'findByIdAndUpdate').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockDeletedExamDocument),
      } as any);

      const result = await repository.delete(id);

      expect(examModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        { isDeleted: true, deletedAt: expect.any(Date) },
        { new: true }
      );
      expect(result).toEqual(mockDeletedExamDocument);
    });

    it('should throw NotFoundException if exam to delete is not found', async () => {
      const id = 'non-existent-id';

      jest.spyOn(examModel, 'findByIdAndUpdate').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(repository.delete(id)).rejects.toThrow(NotFoundException);
    });

    it('should handle errors during delete operation', async () => {
      const id = mockExamId.toString();

      jest.spyOn(examModel, 'findByIdAndUpdate').mockReturnValueOnce({
        exec: jest.fn().mockRejectedValueOnce(new Error('Database error')),
      } as any);

      await expect(repository.delete(id)).rejects.toThrow(RepositoryException);
    });
  });

  describe('hardDelete', () => {
    it('should hard delete an exam successfully', async () => {
      const id = mockExamId.toString();

      jest.spyOn(examModel, 'findByIdAndDelete').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(mockExamDocument),
      } as any);

      const result = await repository.hardDelete(id);

      expect(examModel.findByIdAndDelete).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockExamDocument);
    });

    it('should throw NotFoundException if exam to hard delete is not found', async () => {
      const id = 'non-existent-id';

      jest.spyOn(examModel, 'findByIdAndDelete').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(repository.hardDelete(id)).rejects.toThrow(NotFoundException);
    });

    it('should handle errors during hard delete operation', async () => {
      const id = mockExamId.toString();

      jest.spyOn(examModel, 'findByIdAndDelete').mockReturnValueOnce({
        exec: jest.fn().mockRejectedValueOnce(new Error('Database error')),
      } as any);

      await expect(repository.hardDelete(id)).rejects.toThrow(RepositoryException);
    });
  });

  describe('findWithPagination', () => {
    it('should find exams with pagination', async () => {
      const pagination: PaginationDto = { page: 1, limit: 10 };
      const filter = { status: 'pending' };

      jest.spyOn(examModel, 'find').mockReturnValueOnce({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValueOnce([mockExamDocument]),
      } as any);

      jest.spyOn(examModel, 'countDocuments').mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(1),
      } as any);

      const result = await repository.findWithPagination(pagination, filter);

      expect(examModel.find).toHaveBeenCalledWith({ ...filter, isDeleted: false });
      expect(examModel.countDocuments).toHaveBeenCalledWith({ ...filter, isDeleted: false });
      expect(result.data).toEqual([mockExamDocument]);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    });

    it('should handle errors during findWithPagination operation', async () => {
      const pagination: PaginationDto = { page: 1, limit: 10 };
      const filter = { status: 'pending' };

      jest.spyOn(examModel, 'find').mockReturnValueOnce({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValueOnce(new Error('Database error')),
      } as any);

      await expect(repository.findWithPagination(pagination, filter)).rejects.toThrow(RepositoryException);
    });
  });
});
