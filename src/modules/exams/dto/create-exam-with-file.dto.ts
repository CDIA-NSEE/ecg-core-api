import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsDate,
  IsNumber,
  IsArray,
  IsEnum,
  Min,
} from 'class-validator';
import { MulterFile } from '../interfaces/multer-file.interface';
import { EcgFinding } from '../enums';
import { EcgWaveType } from '../enums';

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
    description: 'The age of the patient',
    example: 30,
    required: false
  })
  @IsNumber()
  @IsOptional()
  age?: number;

  @ApiProperty({
    description: 'The sex of the patient',
    example: 'M',
    required: false
  })
  @IsString()
  @IsOptional()
  sex?: 'M' | 'F';

  @ApiProperty({
    description: 'The date of birth of the patient',
    example: '1980-01-01T00:00:00.000Z',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dateOfBirth?: Date;

  // ECG Parameters - flattened for FormData
  @ApiProperty({
    description: 'Heart rate in beats per minute',
    example: 72,
    required: false,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  heartRate?: number;

  @ApiProperty({
    description: 'Wave durations as JSON string, e.g.',
    example: '[{"wave":"P","duration":120},{"wave":"QRS","duration":80}]',
    required: false,
  })
  @IsString()
  @IsOptional()
  waveDurations?: string;

  @ApiProperty({
    description: 'Wave axes as JSON string, e.g.',
    example: '[{"wave":"P","value":60},{"wave":"QRS","value":30}]',
    required: false,
  })
  @IsString()
  @IsOptional()
  waveAxes?: string;

  @ApiProperty({
    description: 'The medical report of the exam',
    example: 'Normal sinus rhythm, no abnormalities detected',
    required: false,
  })
  @IsString()
  @IsOptional()
  report?: string;

  @ApiProperty({
    description: 'Categories or tags for the exam as comma-separated values',
    example: 'NORMAL_SINUS_RHYTHM,SINUS_BRADYCARDIA',
    required: false,
  })
  @IsString()
  @IsOptional()
  categoriesString?: string;

  @ApiProperty({
    description: 'Version of the exam data',
    example: 1,
    default: 1,
    required: false,
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  version?: number;
}
