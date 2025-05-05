import { Test, TestingModule } from '@nestjs/testing';
import { NativeGridFsRepository } from '../../../../src/shared/database/gridfs/repositories/native-gridfs.repository';
import { Connection } from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';

describe('NativeGridFsRepository', () => {
  let repository: NativeGridFsRepository;
  let connection: Connection;
  let mockGridFsBucket: jest.Mocked<GridFSBucket>;

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
  };

  beforeEach(async () => {
    // Create mock for GridFSBucket
    mockGridFsBucket = {
      openUploadStream: jest.fn(),
      openDownloadStream: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
    } as unknown as jest.Mocked<GridFSBucket>;

    // Mock upload stream
    const mockUploadStream = new Readable({
      read() {}
    }) as any;
    mockUploadStream.id = mockFileId;
    mockUploadStream.on = jest.fn((event, callback) => {
      if (event === 'finish') {
        callback();
      }
      return mockUploadStream;
    });
    mockUploadStream.pipe = jest.fn(() => mockUploadStream);
    mockGridFsBucket.openUploadStream.mockReturnValue(mockUploadStream);

    // Mock download stream
    const mockDownloadStream = new Readable({
      read() {
        this.push(mockFileContent);
        this.push(null);
      }
    });
    mockGridFsBucket.openDownloadStream.mockReturnValue(mockDownloadStream);

    // Mock find cursor
    const mockCursor = {
      next: jest.fn().mockResolvedValue(mockGridFsFile),
      toArray: jest.fn().mockResolvedValue([mockGridFsFile]),
    };
    mockGridFsBucket.find.mockReturnValue(mockCursor as any);

    // Mock MongoDB connection
    const mockCollection = {
      findOne: jest.fn().mockResolvedValue(mockGridFsFile),
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([mockGridFsFile]),
      }),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    };

    const mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    };

    const mockConnection = {
      db: mockDb,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NativeGridFsRepository,
        {
          provide: Connection,
          useValue: mockConnection,
        },
      ],
    }).compile();

    repository = module.get<NativeGridFsRepository>(NativeGridFsRepository);
    connection = module.get<Connection>(Connection);

    // Replace the GridFSBucket with our mock
    (repository as any).gridFsBucket = mockGridFsBucket;
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should upload a file to GridFS', async () => {
      const stream = new Readable({
        read() {
          this.push(mockFileContent);
          this.push(null);
        }
      });

      const result = await repository.create(mockFilename, stream, mockMetadata);

      expect(mockGridFsBucket.openUploadStream).toHaveBeenCalledWith(
        mockFilename,
        { metadata: mockMetadata }
      );
      expect(result).toEqual(mockGridFsFile);
    });
  });

  describe('findById', () => {
    it('should find a file by its ID', async () => {
      const result = await repository.findById(mockFileId.toString());

      expect(connection.db.collection).toHaveBeenCalledWith('uploads.files');
      expect(result).toEqual(mockGridFsFile);
    });

    it('should return null if file not found', async () => {
      jest.spyOn(connection.db.collection('uploads.files'), 'findOne').mockResolvedValueOnce(null);

      const result = await repository.findById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByFilename', () => {
    it('should find files by filename', async () => {
      const result = await repository.findByFilename(mockFilename);

      expect(connection.db.collection).toHaveBeenCalledWith('uploads.files');
      expect(result).toEqual([mockGridFsFile]);
    });
  });

  describe('readStream', () => {
    it('should return a readable stream for a file', async () => {
      const result = await repository.readStream(mockFileId.toString());

      expect(mockGridFsBucket.openDownloadStream).toHaveBeenCalledWith(mockFileId);
      expect(result).toBeInstanceOf(Readable);
    });

    it('should throw an error if file not found', async () => {
      mockGridFsBucket.openDownloadStream.mockImplementationOnce(() => {
        throw new Error('File not found');
      });

      await expect(repository.readStream('nonexistent-id')).rejects.toThrow('File not found');
    });
  });

  describe('delete', () => {
    it('should delete a file from GridFS', async () => {
      mockGridFsBucket.delete.mockResolvedValueOnce(undefined);

      const result = await repository.delete(mockFileId.toString());

      expect(mockGridFsBucket.delete).toHaveBeenCalledWith(mockFileId);
      expect(result).toBe(true);
    });

    it('should return false if deletion fails', async () => {
      mockGridFsBucket.delete.mockImplementationOnce(() => {
        throw new Error('Deletion failed');
      });

      const result = await repository.delete('nonexistent-id');

      expect(result).toBe(false);
    });
  });

  describe('exists', () => {
    it('should return true if file exists', async () => {
      const result = await repository.exists(mockFileId.toString());

      expect(result).toBe(true);
    });

    it('should return false if file does not exist', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValueOnce(null);

      const result = await repository.exists('nonexistent-id');

      expect(result).toBe(false);
    });
  });

  describe('updateMetadata', () => {
    it('should update file metadata', async () => {
      const newMetadata = { ...mockMetadata, additionalField: 'test' };

      const result = await repository.updateMetadata(mockFileId.toString(), newMetadata);

      expect(connection.db.collection).toHaveBeenCalledWith('uploads.files');
      expect(connection.db.collection('uploads.files').updateOne).toHaveBeenCalledWith(
        { _id: mockFileId },
        { $set: { metadata: newMetadata } }
      );
      expect(result).toEqual(mockGridFsFile);
    });

    it('should throw an error if update fails', async () => {
      jest.spyOn(connection.db.collection('uploads.files'), 'updateOne').mockImplementationOnce(() => {
        throw new Error('Update failed');
      });

      await expect(repository.updateMetadata(mockFileId.toString(), {})).rejects.toThrow('Failed to update metadata');
    });
  });
});
