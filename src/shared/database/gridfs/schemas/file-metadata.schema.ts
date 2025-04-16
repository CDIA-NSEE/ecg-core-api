import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

export type FileMetadataDocument = FileMetadata & Document;

export class FileMetadata {
  @ApiProperty({ description: 'Original filename of the uploaded file' })
  @Prop({ required: true })
  originalName: string;

  @ApiProperty({ description: 'GridFS file ID reference' })
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  fileId: mongoose.Types.ObjectId;

  @ApiProperty({ description: 'MIME type of the file' })
  @Prop({ required: true })
  contentType: string;

  @ApiProperty({ description: 'File size in mega bytes' })
  @Prop({ required: true })
  size: number;

  @ApiProperty({ description: 'MD5 hash for file integrity verification' })
  @Prop({ required: true })
  md5Hash: string;

  @ApiProperty({ description: 'Date when the file was uploaded' })
  @Prop({ default: Date.now })
  uploadDate: Date;
}

export const FileMetadataSchema = SchemaFactory.createForClass(FileMetadata);
