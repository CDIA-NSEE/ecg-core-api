import { Test, TestingModule } from '@nestjs/testing';
import { ExamFacadeService } from '../../../../src/modules/exams/services/exam.facade.service';
import { ExamCreatorService } from '../../../../src/modules/exams/services/exam-creator.service';
import { ExamFinderService } from '../../../../src/modules/exams/services/exam-finder.service';
import { ExamUpdaterService } from '../../../../src/modules/exams/services/exam-updater.service';
import { ExamDeleterService } from '../../../../src/modules/exams/services/exam-deleter.service';
import { ExamIndexerService } from '../../../../src/modules/exams/services/exam-indexer.service';
import { CreateExamDto } from '../../../../src/modules/exams/dto/create-exam.dto';
import { UpdateExamDto } from '../../../../src/modules/exams/dto/update-exam.dto';
import { CreateExamWithFileDto } from '../../../../src/modules/exams/dto/create-exam-with-file.dto';
import { ExamResponseEntity } from '../../../../src/modules/exams/entities/exam-response.entity';
import { ExamsPageResponseEntity } from '../../../../src/modules/exams/entities/exams-page-response.entity';
import { PaginationDto } from '../../../../src/shared/common/dto/pagination.dto';
import { ExamDocument } from '../../../../src/modules/exams/schemas/exam.schema';
import mongoose from 'mongoose';

describe('ExamFacadeService', () => {
  let service: ExamFacadeService;
  let creatorService: ExamCreatorService;
  let finderService: ExamFinderService;
  let updaterService: ExamUpdaterService;
  let deleterService: ExamDeleterService;
  let indexerService: ExamIndexerService;

  // Mock exam document
  const mockExamDocument = {
    _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c85'),
    examDate: new Date(),
    report: 'Test report',
    createdAt: new Date(),
    updatedAt: new Date(),
    toObject: () => ({
      _id: '60d21b4667d0d8992e610c85',
      examDate: new Date(),
      report: 'Test report',
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  } as unknown as ExamDocument;

  // Mock pagination metadata
  const mockPaginationMeta = {
    total: 1,
    page: 1,
    limit: 10,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamFacadeService,
        {
          provide: ExamCreatorService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockExamDocument),
            createWithFile: jest.fn().mockResolvedValue(mockExamDocument),
          },
        },
        {
          provide: ExamFinderService,
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockExamDocument),
          },
        },
        {
          provide: ExamUpdaterService,
          useValue: {
            update: jest.fn().mockResolvedValue(mockExamDocument),
          },
        },
        {
          provide: ExamDeleterService,
          useValue: {
            delete: jest.fn().mockResolvedValue(mockExamDocument),
            hardDelete: jest.fn().mockResolvedValue(mockExamDocument),
          },
        },
        {
          provide: ExamIndexerService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([mockExamDocument]),
            findWithPagination: jest.fn().mockResolvedValue({
              items: [mockExamDocument],
              meta: mockPaginationMeta,
            }),
          },
        },
      ],
    }).compile();

    service = module.get<ExamFacadeService>(ExamFacadeService);
    creatorService = module.get<ExamCreatorService>(ExamCreatorService);
    finderService = module.get<ExamFinderService>(ExamFinderService);
    updaterService = module.get<ExamUpdaterService>(ExamUpdaterService);
    deleterService = module.get<ExamDeleterService>(ExamDeleterService);
    indexerService = module.get<ExamIndexerService>(ExamIndexerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an exam and return an ExamResponseEntity', async () => {
      const createExamDto: CreateExamDto = {
        examDate: new Date(),
        report: 'Test report',
      };

      const result = await service.create(createExamDto);

      expect(creatorService.create).toHaveBeenCalledWith(createExamDto);
      expect(result).toBeInstanceOf(ExamResponseEntity);
      expect(result.id).toBe('60d21b4667d0d8992e610c85');
    });
  });

  describe('createWithFile', () => {
    it('should create an exam with file and return an ExamResponseEntity', async () => {
      const mockFile = {
        fieldname: 'file',
        originalname: 'test-ecg.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test file content'),
        size: 1024,
      };

      const createExamWithFileDto: CreateExamWithFileDto = {
        examDate: new Date(),
        report: 'Test report with file',
        file: mockFile,
      };

      const result = await service.createWithFile(createExamWithFileDto);

      expect(creatorService.createWithFile).toHaveBeenCalledWith(createExamWithFileDto);
      expect(result).toBeInstanceOf(ExamResponseEntity);
      expect(result.id).toBe('60d21b4667d0d8992e610c85');
    });
  });

  describe('findAll', () => {
    it('should find all exams and return an array of ExamResponseEntity', async () => {
      const filter = { report: 'Test report' };

      const result = await service.findAll(filter);

      expect(indexerService.findAll).toHaveBeenCalledWith(filter);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0]).toBeInstanceOf(ExamResponseEntity);
      expect(result[0].id).toBe('60d21b4667d0d8992e610c85');
    });
  });

  describe('findWithPagination', () => {
    it('should find exams with pagination and return an ExamsPageResponseEntity', async () => {
      const pagination: PaginationDto = { page: 1, limit: 10 };
      const filter = { report: 'Test report' };

      const result = await service.findWithPagination(pagination, filter);

      expect(indexerService.findWithPagination).toHaveBeenCalledWith(pagination, filter);
      expect(result).toBeInstanceOf(ExamsPageResponseEntity);
      expect(result.items.length).toBe(1);
      expect(result.items[0]).toBeInstanceOf(ExamResponseEntity);
      expect(result.items[0].id).toBe('60d21b4667d0d8992e610c85');
      expect(result.total).toBe(mockPaginationMeta.total);
      expect(result.page).toBe(mockPaginationMeta.page);
      expect(result.limit).toBe(mockPaginationMeta.limit);
    });
  });

  describe('findOne', () => {
    it('should find one exam and return an ExamResponseEntity', async () => {
      const id = '60d21b4667d0d8992e610c85';

      const result = await service.findOne(id);

      expect(finderService.findOne).toHaveBeenCalledWith(id);
      expect(result).toBeInstanceOf(ExamResponseEntity);
      expect(result.id).toBe('60d21b4667d0d8992e610c85');
    });
  });

  describe('update', () => {
    it('should update an exam and return an ExamResponseEntity', async () => {
      const id = '60d21b4667d0d8992e610c85';
      const updateExamDto: UpdateExamDto = {
        report: 'Updated report',
      };

      const result = await service.update(id, updateExamDto);

      expect(updaterService.update).toHaveBeenCalledWith(id, updateExamDto);
      expect(result).toBeInstanceOf(ExamResponseEntity);
      expect(result.id).toBe('60d21b4667d0d8992e610c85');
    });
  });

  describe('delete', () => {
    it('should soft delete an exam and return an ExamResponseEntity', async () => {
      const id = '60d21b4667d0d8992e610c85';

      const result = await service.delete(id);

      expect(deleterService.delete).toHaveBeenCalledWith(id);
      expect(result).toBeInstanceOf(ExamResponseEntity);
      expect(result.id).toBe('60d21b4667d0d8992e610c85');
    });
  });

  describe('hardDelete', () => {
    it('should hard delete an exam and return an ExamResponseEntity', async () => {
      const id = '60d21b4667d0d8992e610c85';

      const result = await service.hardDelete(id);

      expect(deleterService.hardDelete).toHaveBeenCalledWith(id);
      expect(result).toBeInstanceOf(ExamResponseEntity);
      expect(result.id).toBe('60d21b4667d0d8992e610c85');
    });
  });
});
