import { Injectable } from '@nestjs/common';
import { Readable } from 'node:stream';
import { NativeGridFsRepository } from './repositories/native-gridfs.repository';
import { ObjectId } from 'mongodb';

// Import interfaces from repository file
interface GridFSFile {
  _id: ObjectId;
  length: number;
  chunkSize: number;
  uploadDate: Date;
  filename: string;
  md5?: string;
  contentType?: string;
  metadata?: Record<string, any>;
}

interface GridFSUploadResult {
  _id: ObjectId;
  filename: string;
  contentType?: string;
  length: number;
  uploadDate: Date;
  metadata?: Record<string, any>;
}

@Injectable()
export class GridFsService {
  constructor(private readonly gridFsRepository: NativeGridFsRepository) {}

  async uploadFile(
    filename: string,
    buffer: Buffer,
    metadata?: Record<string, any>,
  ): Promise<GridFSUploadResult> {
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);

    return this.gridFsRepository.create(filename, readableStream, metadata);
  }

  async findFile(fileId: string): Promise<GridFSFile | null> {
    return this.gridFsRepository.findById(fileId);
  }

  async findFilesByName(filename: string): Promise<GridFSFile[]> {
    return this.gridFsRepository.findByFilename(filename);
  }

  async downloadFile(fileId: string): Promise<Readable> {
    return this.gridFsRepository.readStream(fileId);
  }

  async deleteFile(fileId: string): Promise<boolean> {
    return this.gridFsRepository.delete(fileId);
  }

  async fileExists(fileId: string): Promise<boolean> {
    return this.gridFsRepository.exists(fileId);
  }
  
  async updateFileMetadata(fileId: string, metadata: Record<string, any>): Promise<GridFSFile | null> {
    return this.gridFsRepository.updateMetadata(fileId, metadata);
  }
}
