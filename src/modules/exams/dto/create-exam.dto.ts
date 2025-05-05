import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDate, IsEnum, IsNumber, IsArray, ValidateNested, IsObject, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { EcgFinding } from '../enums';
import { FileMetadataDto } from '../../../shared/database/gridfs/dto';
import { EcgParametersDto } from './ecg-parameters.dto';

export class CreateExamDto {
  @ApiProperty({ description: 'The date when the exam was performed', example: '2025-04-14T15:00:00Z' })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  examDate: Date;

  @ApiProperty({ description: 'The age of the patient', example: 30, required: false })
  @IsNumber()
  @IsOptional()
  age?: number;

  @ApiProperty({ description: 'The sex of the patient', example: 'M', required: false })
  @IsString()
  @IsOptional()
  sex?: 'M' | 'F';

  @ApiProperty({ description: 'The date of birth of the patient', example: '1980-01-01T00:00:00Z', required: false })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dateOfBirth?: Date;

  @ApiProperty({ description: 'File metadata for the exam', required: false, type: FileMetadataDto })
  @ValidateNested()
  @Type(() => FileMetadataDto)
  @IsOptional()
  fileMetadata?: FileMetadataDto;

  @ApiProperty({ description: 'ECG-specific parameters', required: false, type: EcgParametersDto })
  @ValidateNested()
  @Type(() => EcgParametersDto)
  @IsOptional()
  ecgParameters?: EcgParametersDto;

  @ApiProperty({ description: 'The medical report of the exam', example: 'Normal sinus rhythm', required: false })
  @IsString()
  @IsOptional()
  report?: string;

  @ApiProperty({ 
    description: 'Categories or tags for the exam', 
    example: ['NORMAL_SINUS_RHYTHM', 'SINUS_TACHYCARDIA'], 
    required: false,
    enum: EcgFinding,
    isArray: true
  })
  @IsArray()
  @IsEnum(EcgFinding, { each: true })
  @IsOptional()
  categories?: EcgFinding[];

  @ApiProperty({ description: 'Version of the exam data', example: 1, default: 1 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  version?: number;
}
