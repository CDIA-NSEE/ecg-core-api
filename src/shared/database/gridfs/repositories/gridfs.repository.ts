import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { createModel } from 'mongoose-gridfs';
import { Readable } from 'stream';

@Injectable()
export class GridFsRepository {
  private fileModel: any;

  constructor(@InjectConnection() private readonly connection: Connection) {
    this.fileModel = createModel({
      modelName: 'File',
      connection: this.connection,
    });
  }

  async create(
    filename: string,
    stream: Readable,
    metadata?: Record<string, any>,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const writeStream = this.fileModel.write(
        {
          filename,
          metadata,
        },
        stream,
        (error: any, file: any) => {
          if (error) reject(error);
          resolve(file);
        },
      );
    });
  }

  async findById(fileId: string): Promise<any> {
    return this.fileModel.findById(fileId);
  }

  async findByFilename(filename: string): Promise<any> {
    return this.fileModel.find({ filename }).exec();
  }

  async readStream(fileId: string): Promise<Readable> {
    return this.fileModel.readById(fileId);
  }

  async delete(fileId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.fileModel.unlink(fileId, (error: any) => {
        if (error) reject(error);
        resolve(true);
      });
    });
  }

  async exists(fileId: string): Promise<boolean> {
    const file = await this.findById(fileId);
    return !!file;
  }
}
