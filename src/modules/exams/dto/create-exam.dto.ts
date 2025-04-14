import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDate, IsEnum, IsNumber, IsUrl, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExamDto {
  @ApiProperty({ description: 'The date when the exam was performed', example: '2025-04-14T15:00:00Z' })
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  examDate: Date;

  @ApiProperty({ description: 'The date of birth of the patient', example: '1980-01-01T00:00:00Z', required: false })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dateOfBirth?: Date;

  @ApiProperty({ description: 'The URL of the exam image from GridFS', example: 'gridfs://exams/123456789', required: false })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ description: 'The amplitude of the ECG signal', example: 1.5, required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  amplitude?: number;

  @ApiProperty({ description: 'The velocity of the ECG signal', example: 25, required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  velocity?: number;

  @ApiProperty({ description: 'The medical report of the exam', example: 'Normal sinus rhythm', required: false })
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
    description: 'The status of the exam', 
    example: 'pending', 
    enum: ['pending', 'completed', 'canceled'],
    default: 'pending'
  })
  @IsEnum(['pending', 'completed', 'canceled'])
  @IsOptional()
  status?: string;
}
