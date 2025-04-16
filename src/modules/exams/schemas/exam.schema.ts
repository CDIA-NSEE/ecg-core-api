import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { BaseDocument } from '../../../shared/common/schemas';
import { EcgParameters } from './ecg-parameters.schema';
import { FileMetadata } from '../../../shared/database/gridfs/schemas';
import { EcgFinding } from '../enums';

export type ExamDocument = Exam & BaseDocument;

@Schema({ timestamps: true })
export class Exam extends BaseDocument {
  @ApiProperty({ description: 'The date when the exam was performed' })
  @Prop({ required: true })
  examDate: Date;

  @ApiProperty({ description: 'The date of birth of the patient' })
  @Prop()
  dateOfBirth?: Date;

  @ApiProperty({ description: 'File metadata for the exam' })
  @Prop({ type: FileMetadata })
  fileMetadata?: FileMetadata;

  @ApiProperty({ description: 'ECG-specific parameters' })
  @Prop({ type: [EcgParameters] })
  ecgParameters?: EcgParameters;

  @ApiProperty({ description: 'The medical report of the exam' })
  @Prop()
  report?: string;

  @ApiProperty({ description: 'Categories or tags for the exam' })
  @Prop({ type: [String], enum: EcgFinding, default: [] })
  categories?: EcgFinding[];


  @ApiProperty({ description: 'Version of the exam data' })
  @Prop({ default: 1 })
  version: number;
}

export const ExamSchema = SchemaFactory.createForClass(Exam);
