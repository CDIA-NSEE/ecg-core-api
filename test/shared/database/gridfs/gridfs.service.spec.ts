import { Test, TestingModule } from '@nestjs/testing';
import { GridFsService } from '../../../../src/shared/database/gridfs/gridfs.service';
import { NativeGridFsRepository } from '../../../../src/shared/database/gridfs/repositories/native-gridfs.repository';
import { Readable } from 'stream';
import { ObjectId } from 'mongodb';

describe('GridFsService', () => {
  let service: GridFsService;
  let repository: NativeGridFsRepository;

  // Mock file data
  const mockFileId = new ObjectId('60d21b4667d0d8992e610c86');
  const mockFileContent = Buffer.from('test file content');
  const mockFilename = 'test-file.jpg';
  const mockMetadata = { contentType: 'image/jpeg', examId: '60d21b4667d0d8992e610c85' };

  // Mock GridFS file document
  const mockGridFsFile = {
    _id: mockFileId,
    filename: mockFilename,
    length: mockFileContent.length,
    chunkSize: 255 * 1024,
    uploadDate: new Date(),
    metadata: mockMetadata,
    contentType: 'image/jpeg',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GridFsService,
        {
          provide: NativeGridFsRepository,
          useValue: {
            create: jest.fn().mockResolvedValue(mockGridFsFile),
            findById: jest.fn().mockResolvedValue(mockGridFsFile),
            findByFilename: jest.fn().mockResolvedValue([mockGridFsFile]),
            readStream: jest.fn().mockResolvedValue(new Readable({
              read() {
                this.push(mockFileContent);
                this.push(null);
              }
            })),
            delete: jest.fn().mockResolvedValue(true),
            exists: jest.fn().mockResolvedValue(true),
            updateMetadata: jest.fn().mockResolvedValue(mockGridFsFile),
          },
        },
      ],
    }).compile();

    service = module.get<GridFsService>(GridFsService);
    repository = module.get<NativeGridFsRepository>(NativeGridFsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should upload a file to GridFS', async () => {
      const buffer = Buffer.from('test file content');
      const filename = 'test-file.jpg';
      const metadata = { contentType: 'image/jpeg' };

      const result = await service.uploadFile(filename, buffer, metadata);

      // Verify that the repository's create method was called with a readable stream
      expect(repository.create).toHaveBeenCalledWith(
        filename,
        expect.any(Readable),
        metadata
      );
      
      expect(result).toEqual(mockGridFsFile);
    });
  });

  describe('findFile', () => {
    it('should find a file by ID', async () => {
      const result = await service.findFile(mockFileId.toString());

      expect(repository.findById).toHaveBeenCalledWith(mockFileId.toString());
      expect(result).toEqual(mockGridFsFile);
    });
  });

  describe('findFilesByName', () => {
    it('should find files by filename', async () => {
      const result = await service.findFilesByName(mockFilename);

      expect(repository.findByFilename).toHaveBeenCalledWith(mockFilename);
      expect(result).toEqual([mockGridFsFile]);
    });
  });

  describe('downloadFile', () => {
    it('should return a readable stream for a file', async () => {
      const result = await service.downloadFile(mockFileId.toString());

      expect(repository.readStream).toHaveBeenCalledWith(mockFileId.toString());
      expect(result).toBeInstanceOf(Readable);
    });
  });

  describe('deleteFile', () => {
    it('should delete a file', async () => {
      const result = await service.deleteFile(mockFileId.toString());

      expect(repository.delete).toHaveBeenCalledWith(mockFileId.toString());
      expect(result).toBe(true);
    });
  });

  describe('fileExists', () => {
    it('should check if a file exists', async () => {
      const result = await service.fileExists(mockFileId.toString());

      expect(repository.exists).toHaveBeenCalledWith(mockFileId.toString());
      expect(result).toBe(true);
    });
  });

  describe('updateFileMetadata', () => {
    it('should update file metadata', async () => {
      const newMetadata = { ...mockMetadata, additionalField: 'test' };

      const result = await service.updateFileMetadata(mockFileId.toString(), newMetadata);

      expect(repository.updateMetadata).toHaveBeenCalledWith(mockFileId.toString(), newMetadata);
      expect(result).toEqual(mockGridFsFile);
    });
  });
});
