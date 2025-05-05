import { Test, TestingModule } from '@nestjs/testing';
import { ExamCreatorService } from '../../../../src/modules/exams/services/exam-creator.service';
import { ExamRepository } from '../../../../src/modules/exams/repositories';
import { GridFsService } from '../../../../src/shared/database/gridfs/gridfs.service';
import { LoggerService } from '../../../../src/shared/common/services/logger.service';
import { CreateExamDto } from '../../../../src/modules/exams/dto/create-exam.dto';
import { CreateExamWithFileDto } from '../../../../src/modules/exams/dto/create-exam-with-file.dto';
import { ExamDocument } from '../../../../src/modules/exams/schemas/exam.schema';
import { BadRequestException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import * as mongoose from 'mongoose';
import * as crypto from 'crypto';

describe('ExamCreatorService', () => {
  let service: ExamCreatorService;
  let examRepository: ExamRepository;
  let gridFsService: GridFsService;
  let loggerService: LoggerService;

  // Mock exam document
  const mockExamDocument = {
    _id: new mongoose.Types.ObjectId('60d21b4667d0d8992e610c85'),
    examDate: new Date(),
    report: 'Test report',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as ExamDocument;

  // Mock GridFS upload result
  const mockGridFsUploadResult = {
    _id: new ObjectId('60d21b4667d0d8992e610c86'),
    filename: 'exam_1620000000000_abcdef123456_test-ecg.jpg',
    contentType: 'image/jpeg',
    length: 1024,
    uploadDate: new Date(),
    metadata: {
      contentType: 'image/jpeg',
      examDate: new Date(),
      md5Hash: 'abcdef123456',
      fileType: 'image',
      uploadTimestamp: new Date(),
    },
  };

  // Mock file for upload tests
  const mockFile = {
    fieldname: 'file',
    originalname: 'test-ecg.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('test file content'),
    size: 1024,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamCreatorService,
        {
          provide: ExamRepository,
          useValue: {
            create: jest.fn().mockResolvedValue(mockExamDocument),
          },
        },
        {
          provide: GridFsService,
          useValue: {
            uploadFile: jest.fn().mockResolvedValue(mockGridFsUploadResult),
            updateFileMetadata: jest.fn().mockResolvedValue(mockGridFsUploadResult),
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

    service = module.get<ExamCreatorService>(ExamCreatorService);
    examRepository = module.get<ExamRepository>(ExamRepository);
    gridFsService = module.get<GridFsService>(GridFsService);
    loggerService = module.get<LoggerService>(LoggerService);

    // Mock crypto.createHash for consistent testing
    jest.spyOn(crypto, 'createHash').mockImplementation(() => {
      const mockHash = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('abcdef123456'),
        copy: jest.fn(),
        write: jest.fn().mockReturnThis(),
        end: jest.fn().mockReturnThis(),
        read: jest.fn(),
        _transform: jest.fn(),
        _flush: jest.fn(),
        pipe: jest.fn(),
        on: jest.fn().mockReturnThis(),
        once: jest.fn().mockReturnThis(),
        prependListener: jest.fn().mockReturnThis(),
        prependOnceListener: jest.fn().mockReturnThis(),
        removeListener: jest.fn().mockReturnThis(),
        off: jest.fn().mockReturnThis(),
        removeAllListeners: jest.fn().mockReturnThis(),
        setMaxListeners: jest.fn().mockReturnThis(),
        getMaxListeners: jest.fn().mockReturnValue(10),
        listeners: jest.fn().mockReturnValue([]),
        rawListeners: jest.fn().mockReturnValue([]),
        emit: jest.fn().mockReturnValue(true),
        listenerCount: jest.fn().mockReturnValue(0),
        eventNames: jest.fn().mockReturnValue([]),
        allowHalfOpen: true,
        writable: true,
        readable: true
      };
      return mockHash as unknown as crypto.Hash;
    });

    // Mock Date.now for consistent filename generation
    jest.spyOn(Date, 'now').mockReturnValue(1620000000000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an exam successfully', async () => {
      const createExamDto: CreateExamDto = {
        examDate: new Date(),
        report: 'Test report',
      };

      const result = await service.create(createExamDto);

      expect(examRepository.create).toHaveBeenCalledWith(createExamDto);
      expect(result).toEqual(mockExamDocument);
    });
  });

  describe('createWithFile', () => {
    it('should throw BadRequestException if file is missing', async () => {
      const createExamWithFileDto: CreateExamWithFileDto = {
        examDate: new Date(),
        report: 'Test report with file',
        file: null as any, // Type assertion to avoid TS error
      };

      await expect(service.createWithFile(createExamWithFileDto)).rejects.toThrow(BadRequestException);
      expect(loggerService.logOperation).toHaveBeenCalled();
    });

    it('should throw BadRequestException if file buffer is missing', async () => {
      const createExamWithFileDto: CreateExamWithFileDto = {
        examDate: new Date(),
        report: 'Test report with file',
        file: { ...mockFile, buffer: null as any }, // Type assertion to avoid TS error
      };

      await expect(service.createWithFile(createExamWithFileDto)).rejects.toThrow(BadRequestException);
      expect(loggerService.logOperation).toHaveBeenCalled();
    });

    it('should create an exam with file successfully', async () => {
      const createExamWithFileDto: CreateExamWithFileDto = {
        examDate: new Date(),
        report: 'Test report with file',
        file: mockFile,
      };

      const result = await service.createWithFile(createExamWithFileDto);

      // Check if GridFS upload was called with correct parameters
      expect(gridFsService.uploadFile).toHaveBeenCalledWith(
        'exam_1620000000000_abcdef123456_test-ecg.jpg',
        mockFile.buffer,
        expect.objectContaining({
          contentType: 'image/jpeg',
          md5Hash: 'abcdef123456',
          fileType: 'image',
        })
      );

      // Check if exam was created with correct file metadata
      expect(examRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          examDate: createExamWithFileDto.examDate,
          report: createExamWithFileDto.report,
          fileMetadata: expect.objectContaining({
            originalName: 'test-ecg.jpg',
            contentType: 'image/jpeg',
            md5Hash: 'abcdef123456',
          }),
        })
      );

      // Check if file metadata was updated with exam ID reference
      expect(gridFsService.updateFileMetadata).toHaveBeenCalledWith(
        mockGridFsUploadResult._id.toString(),
        expect.objectContaining({
          examId: mockExamDocument._id.toString(),
        })
      );

      expect(result).toEqual(mockExamDocument);
    });

    it('should parse wave durations from JSON string', async () => {
      const waveDurations = [{ wave: 'P', duration: 120 }, { wave: 'QRS', duration: 80 }];
      const createExamWithFileDto: CreateExamWithFileDto = {
        examDate: new Date(),
        report: 'Test report with file',
        file: mockFile,
        waveDurations: JSON.stringify(waveDurations),
      };

      await service.createWithFile(createExamWithFileDto);

      expect(examRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ecgParameters: expect.objectContaining({
            durations: waveDurations,
          }),
        })
      );
    });

    it('should parse wave axes from JSON string', async () => {
      const waveAxes = [{ wave: 'P', angle: 60 }, { wave: 'QRS', angle: 30 }];
      const createExamWithFileDto: CreateExamWithFileDto = {
        examDate: new Date(),
        report: 'Test report with file',
        file: mockFile,
        waveAxes: JSON.stringify(waveAxes),
      };

      await service.createWithFile(createExamWithFileDto);

      expect(examRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ecgParameters: expect.objectContaining({
            axes: waveAxes,
          }),
        })
      );
    });

    it('should parse categories from comma-separated string', async () => {
      const categoriesString = 'NORMAL,SINUS_RHYTHM,BRADYCARDIA';
      const createExamWithFileDto: CreateExamWithFileDto = {
        examDate: new Date(),
        report: 'Test report with file',
        file: mockFile,
        categoriesString,
      };

      await service.createWithFile(createExamWithFileDto);

      expect(examRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          categories: ['NORMAL', 'SINUS_RHYTHM', 'BRADYCARDIA'],
        })
      );
    });

    it('should handle errors during file upload', async () => {
      const createExamWithFileDto: CreateExamWithFileDto = {
        examDate: new Date(),
        report: 'Test report with file',
        file: mockFile,
      };

      jest.spyOn(gridFsService, 'uploadFile').mockRejectedValueOnce(new Error('Upload failed'));

      await expect(service.createWithFile(createExamWithFileDto)).rejects.toThrow(Error);
      expect(loggerService.logError).toHaveBeenCalled();
    });
  });
});
