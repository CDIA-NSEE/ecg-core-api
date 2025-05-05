import { Test, TestingModule } from '@nestjs/testing';
import { ExamsController } from '../../../src/modules/exams/exams.controller';
import { ExamFacadeService } from '../../../src/modules/exams/services/exam.facade.service';
import { LoggerService } from '../../../src/shared/common/services/logger.service';
import { CreateExamDto } from '../../../src/modules/exams/dto/create-exam.dto';
import { UpdateExamDto } from '../../../src/modules/exams/dto/update-exam.dto';
import { FindMultipleExamsDto } from '../../../src/modules/exams/dto/find-multiple-exams.dto';
import { CreateExamWithFileDto } from '../../../src/modules/exams/dto/create-exam-with-file.dto';
import { ExamResponseEntity } from '../../../src/modules/exams/entities/exam-response.entity';
import { ExamsPageResponseEntity } from '../../../src/modules/exams/entities/exams-page-response.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { FindOneDto } from '../../../src/modules/exams/dto/find-one.dto';
import { MulterFile } from '../../../src/modules/exams/interfaces/multer-file.interface';

describe('ExamsController', () => {
  let controller: ExamsController;
  let facadeService: ExamFacadeService;
  let loggerService: LoggerService;

  // Mock response data
  const mockExamResponse = new ExamResponseEntity();
  mockExamResponse.id = 'exam-id-123';
  mockExamResponse.examDate = new Date();
  mockExamResponse.report = 'Test report';

  const mockPageResponse = new ExamsPageResponseEntity(
    [mockExamResponse],
    { 
      total: 1, 
      page: 1, 
      limit: 10,
      lastPage: 1,
      hasNextPage: false,
      hasPreviousPage: false
    }
  );

  // Mock file for upload tests
  const mockFile: MulterFile = {
    fieldname: 'file',
    originalname: 'test-ecg.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('test file content'),
    size: 1024,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamsController],
      providers: [
        {
          provide: ExamFacadeService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockExamResponse),
            createWithFile: jest.fn().mockResolvedValue(mockExamResponse),
            findWithPagination: jest.fn().mockResolvedValue(mockPageResponse),
            findOne: jest.fn().mockResolvedValue(mockExamResponse),
            update: jest.fn().mockResolvedValue(mockExamResponse),
            delete: jest.fn().mockResolvedValue(mockExamResponse),
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

    controller = module.get<ExamsController>(ExamsController);
    facadeService = module.get<ExamFacadeService>(ExamFacadeService);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an exam successfully', async () => {
      const createExamDto: CreateExamDto = {
        examDate: new Date(),
        report: 'Test report',
      };

      const result = await controller.create(createExamDto);
      
      expect(facadeService.create).toHaveBeenCalledWith(createExamDto);
      expect(result).toEqual(mockExamResponse);
    });

    it('should handle errors when creating an exam', async () => {
      const createExamDto: CreateExamDto = {
        examDate: new Date(),
        report: 'Test report',
      };

      jest.spyOn(facadeService, 'create').mockRejectedValueOnce(new Error('Test error'));

      await expect(controller.create(createExamDto)).rejects.toThrow(InternalServerErrorException);
      expect(loggerService.error).toHaveBeenCalled();
    });
  });

  describe('uploadFile', () => {
    it('should create an exam with file successfully', async () => {
      const createExamWithFileDto: CreateExamWithFileDto = {
        examDate: new Date(),
        report: 'Test report with file',
        file: null as any, // Type assertion to avoid TS error
      };

      const result = await controller.uploadFile(mockFile, createExamWithFileDto);
      
      expect(facadeService.createWithFile).toHaveBeenCalled();
      expect(result).toEqual(mockExamResponse);
    });

    it('should handle errors when creating an exam with file', async () => {
      const createExamWithFileDto: CreateExamWithFileDto = {
        examDate: new Date(),
        report: 'Test report with file',
        file: null as any, // Type assertion to avoid TS error
      };

      jest.spyOn(facadeService, 'createWithFile').mockRejectedValueOnce(new Error('Test error'));

      await expect(controller.uploadFile(mockFile, createExamWithFileDto)).rejects.toThrow(InternalServerErrorException);
      expect(loggerService.error).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should find all exams with pagination successfully', async () => {
      const findMultipleExamsDto: FindMultipleExamsDto = {
        page: 1,
        limit: 10,
      };

      const result = await controller.findAll(findMultipleExamsDto);
      
      expect(facadeService.findWithPagination).toHaveBeenCalledWith(
        { page: findMultipleExamsDto.page, limit: findMultipleExamsDto.limit },
        { search: undefined, status: undefined, userId: undefined, patientId: undefined }
      );
      expect(result).toEqual(mockPageResponse);
    });

    it('should handle errors when finding exams', async () => {
      const findMultipleExamsDto: FindMultipleExamsDto = {
        page: 1,
        limit: 10,
      };

      jest.spyOn(facadeService, 'findWithPagination').mockRejectedValueOnce(new Error('Test error'));

      await expect(controller.findAll(findMultipleExamsDto)).rejects.toThrow(InternalServerErrorException);
      expect(loggerService.error).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should find an exam by id successfully', async () => {
      const findOneDto: FindOneDto = { id: 'exam-id-123' };

      const result = await controller.findOne(findOneDto);
      
      expect(facadeService.findOne).toHaveBeenCalledWith(findOneDto.id);
      expect(result).toEqual(mockExamResponse);
    });

    it('should handle errors when finding an exam', async () => {
      const findOneDto: FindOneDto = { id: 'exam-id-123' };

      jest.spyOn(facadeService, 'findOne').mockRejectedValueOnce(new Error('Test error'));

      await expect(controller.findOne(findOneDto)).rejects.toThrow(InternalServerErrorException);
      expect(loggerService.error).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an exam successfully', async () => {
      const findOneDto: FindOneDto = { id: 'exam-id-123' };
      const updateExamDto: UpdateExamDto = {
        report: 'Updated report',
      };

      const result = await controller.update(findOneDto, updateExamDto);
      
      expect(facadeService.update).toHaveBeenCalledWith(findOneDto.id, updateExamDto);
      expect(result).toEqual(mockExamResponse);
    });

    it('should handle errors when updating an exam', async () => {
      const findOneDto: FindOneDto = { id: 'exam-id-123' };
      const updateExamDto: UpdateExamDto = {
        report: 'Updated report',
      };

      jest.spyOn(facadeService, 'update').mockRejectedValueOnce(new Error('Test error'));

      await expect(controller.update(findOneDto, updateExamDto)).rejects.toThrow(InternalServerErrorException);
      expect(loggerService.error).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete an exam successfully', async () => {
      const findOneDto: FindOneDto = { id: 'exam-id-123' };

      const result = await controller.delete(findOneDto);
      
      expect(facadeService.delete).toHaveBeenCalledWith(findOneDto.id);
      expect(result).toEqual(mockExamResponse);
    });

    it('should handle errors when deleting an exam', async () => {
      const findOneDto: FindOneDto = { id: 'exam-id-123' };

      jest.spyOn(facadeService, 'delete').mockRejectedValueOnce(new Error('Test error'));

      await expect(controller.delete(findOneDto)).rejects.toThrow(InternalServerErrorException);
      expect(loggerService.error).toHaveBeenCalled();
    });
  });
});
