import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import * as mongoose from 'mongoose';

export class FileMetadataDto {
  @ApiProperty({ description: 'Original filename of the uploaded file' })
  @IsString()
  @IsNotEmpty()
  originalName: string;

  @ApiProperty({ description: 'GridFS file ID reference' })
  @IsNotEmpty()
  fileId: mongoose.Types.ObjectId;

  @ApiProperty({ description: 'MIME type of the file' })
  @IsString()
  @IsNotEmpty()
  contentType: string;

  @ApiProperty({ description: 'File size in mega bytes' })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  size: number;

  @ApiProperty({ description: 'MD5 hash for file integrity verification' })
  @IsString()
  @IsNotEmpty()
  md5Hash: string;

  @ApiProperty({ description: 'Date when the file was uploaded' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  uploadDate?: Date;
}
