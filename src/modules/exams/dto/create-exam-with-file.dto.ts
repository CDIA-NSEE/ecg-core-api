import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsDate,
  IsNumber,
  IsArray,
  IsEnum,
} from 'class-validator';
import { MulterFile } from '../interfaces/multer-file.interface';

export class CreateExamWithFileDto {
  @ApiProperty({
    description: 'The uploaded file',
    type: 'string',
    format: 'binary',
    required: true,
  })
  file: MulterFile;

  @ApiProperty({
    description: 'The date when the exam was performed',
    example: '2025-04-14T18:00:00.000Z',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  examDate?: Date;

  @ApiProperty({
    description: 'The date of birth of the patient',
    example: '1980-01-01T00:00:00.000Z',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dateOfBirth?: Date;

  @ApiProperty({
    description: 'The amplitude of the ECG signal',
    example: 1.5,
    required: false,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  amplitude?: number;

  @ApiProperty({
    description: 'The velocity of the ECG signal',
    example: 25,
    required: false,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  velocity?: number;

  @ApiProperty({
    description: 'The medical report of the exam',
    example: 'Normal sinus rhythm, no abnormalities detected',
    required: false,
  })
  @IsString()
  @IsOptional()
  report?: string;

  @ApiProperty({
    description: 'Categories or tags for the exam',
    example: ['routine', 'annual-checkup'],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  categories?: string[];

  @ApiProperty({
    description: 'The status of the exam',
    example: 'pending',
    enum: ['pending', 'completed', 'canceled'],
    default: 'pending',
    required: false,
  })
  @IsEnum(['pending', 'completed', 'canceled'])
  @IsOptional()
  status?: 'pending' | 'completed' | 'canceled';
}
