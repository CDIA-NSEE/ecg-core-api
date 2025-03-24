import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { GridFsRepository } from './repositories/gridfs.repository';

@Injectable()
export class GridFsService {
  constructor(private readonly gridFsRepository: GridFsRepository) {}

  async uploadFile(
    filename: string,
    buffer: Buffer,
    metadata?: Record<string, any>,
  ): Promise<any> {
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);

    return this.gridFsRepository.create(filename, readableStream, metadata);
  }

  async findFile(fileId: string): Promise<any> {
    return this.gridFsRepository.findById(fileId);
  }

  async findFilesByName(filename: string): Promise<any[]> {
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
}
