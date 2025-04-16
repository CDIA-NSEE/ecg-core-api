import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../shared/common/entities/base.entity';
import { ExamDocument } from '../schemas/exam.schema';
import { Types } from 'mongoose';
import { EcgFinding } from '../enums';
import { FileMetadataDto } from '../../../shared/database/gridfs/dto';
import { EcgParameters } from '../schemas/ecg-parameters.schema';

export class ExamResponseEntity extends BaseEntity {
  @ApiProperty({ description: 'The unique identifier of the exam' })
  id: string;

  @ApiProperty({ description: 'The date when the exam was performed' })
  examDate: Date;

  @ApiProperty({ description: 'The date of birth of the patient' })
  dateOfBirth?: Date;

  @ApiProperty({ description: 'File metadata for the exam' })
  fileMetadata?: FileMetadataDto;

  @ApiProperty({ description: 'ECG-specific parameters' })
  ecgParameters?: EcgParameters;

  @ApiProperty({ description: 'The medical report of the exam' })
  report?: string;

  @ApiProperty({ description: 'Categories or tags for the exam', type: [String], enum: EcgFinding })
  categories?: EcgFinding[];

  @ApiProperty({ description: 'Version of the exam data' })
  version: number;

  @ApiProperty({ description: 'Whether the exam is deleted (soft delete)' })
  deletedAt?: Date;

  @ApiProperty({ description: 'The creation date of the exam' })
  createdAt: Date;

  @ApiProperty({ description: 'The last update date of the exam' })
  updatedAt: Date;

  constructor(partial?: Partial<ExamResponseEntity>) {
    super(partial);
    if (partial) {
      Object.assign(this, partial);
    }
  }

  static fromEntity(exam: ExamDocument): ExamResponseEntity {
    return new ExamResponseEntity({
      id: exam._id.toString(),
      examDate: exam.examDate,
      dateOfBirth: exam.dateOfBirth,
      fileMetadata: exam.fileMetadata,
      ecgParameters: exam.ecgParameters,
      report: exam.report,
      categories: exam.categories,
      version: exam.version,
      deletedAt: exam.deletedAt,
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt,
    });
  }

  static fromEntities(exams: ExamDocument[]): ExamResponseEntity[] {
    return exams.map((exam) => ExamResponseEntity.fromEntity(exam));
  }
}
