import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDate, IsMongoId, IsEnum, IsNumber, IsUrl, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class UpdateExamDto {
  @ApiProperty({
    description: 'The title of the exam',
    example: 'Updated Cardiac Evaluation',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'The description of the exam',
    example: 'Updated routine cardiac checkup',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The date when the exam was performed',
    example: '2025-04-14T15:00:00Z',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  examDate?: Date;

  @ApiProperty({
    description: 'The date of birth of the patient',
    example: '1980-01-01T00:00:00Z',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dateOfBirth?: Date;

  @ApiProperty({
    description: 'The URL of the exam image from GridFS',
    example: 'gridfs://exams/123456789',
    required: false,
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({
    description: 'The amplitude of the ECG signal',
    example: 1.5,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  amplitude?: number;

  @ApiProperty({
    description: 'The velocity of the ECG signal',
    example: 25,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  velocity?: number;

  @ApiProperty({
    description: 'The medical report of the exam',
    example: 'Normal sinus rhythm',
    required: false,
  })
  @IsString()
  @IsOptional()
  report?: string;

  @ApiProperty({
    description: 'Categories or tags for the exam',
    example: ['cardiac', 'routine'],
    required: false,
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categories?: string[];

  @ApiProperty({
    description: 'The user ID who performed the exam',
    example: '6071f2e7c4c1b40b9c9b2c9a',
    required: false,
  })
  @IsMongoId()
  @IsOptional()
  userId?: Types.ObjectId;

  @ApiProperty({
    description: 'The patient ID for whom the exam was performed',
    example: '6071f2e7c4c1b40b9c9b2c9b',
    required: false,
  })
  @IsMongoId()
  @IsOptional()
  patientId?: Types.ObjectId;

  @ApiProperty({
    description: 'The status of the exam',
    example: 'completed',
    enum: ['pending', 'completed', 'canceled'],
    required: false,
  })
  @IsEnum(['pending', 'completed', 'canceled'])
  @IsOptional()
  status?: string;
}
