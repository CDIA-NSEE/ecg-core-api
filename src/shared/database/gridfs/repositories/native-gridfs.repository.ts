import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';

// Define interfaces for GridFS operations
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
export class NativeGridFsRepository {
  private gridFsBucket: GridFSBucket;

  constructor(@InjectConnection() private readonly connection: Connection) {
    this.gridFsBucket = new GridFSBucket(this.connection.db, {
      bucketName: 'uploads', // Name of your GridFS bucket
      chunkSizeBytes: 255 * 1024, // 255KB chunks
    });
  }

  async create(
    filename: string,
    stream: Readable,
    metadata?: Record<string, any>,
  ): Promise<GridFSUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.gridFsBucket.openUploadStream(filename, {
        metadata,
      });

      uploadStream.on('error', (error) => reject(error));
      uploadStream.on('finish', () => {
        this.findById(uploadStream.id.toString())
          .then(file => resolve(file as GridFSUploadResult))
          .catch(err => reject(err));
      });

      stream.pipe(uploadStream);
    });
  }

  async findById(fileId: string): Promise<GridFSFile | null> {
    try {
      const _id = new ObjectId(fileId);
      const files = this.connection.db.collection('uploads.files');
      return await files.findOne({ _id }) as GridFSFile | null;
    } catch (error) {
      return null;
    }
  }

  async findByFilename(filename: string): Promise<GridFSFile[]> {
    const files = this.connection.db.collection('uploads.files');
    return await files.find({ filename }).toArray() as GridFSFile[];
  }

  async readStream(fileId: string): Promise<Readable> {
    try {
      const _id = new ObjectId(fileId);
      return this.gridFsBucket.openDownloadStream(_id);
    } catch (error) {
      throw new Error(`File not found: ${error.message}`);
    }
  }

  async delete(fileId: string): Promise<boolean> {
    try {
      const _id = new ObjectId(fileId);
      await this.gridFsBucket.delete(_id);
      return true;
    } catch (error) {
      return false;
    }
  }

  async exists(fileId: string): Promise<boolean> {
    const file = await this.findById(fileId);
    return !!file;
  }

  async updateMetadata(fileId: string, metadata: Record<string, any>): Promise<GridFSFile | null> {
    try {
      const _id = new ObjectId(fileId);
      const files = this.connection.db.collection('uploads.files');
      
      await files.updateOne(
        { _id },
        { $set: { metadata } }
      );
      
      return this.findById(fileId);
    } catch (error) {
      throw new Error(`Failed to update metadata: ${error.message}`);
    }
  }
}
