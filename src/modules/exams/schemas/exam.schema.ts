import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { BaseDocument } from '../../../shared/common/schemas';
import { EcgParameters } from './ecg-parameters.schema';
import { FileMetadata } from '../../../shared/database/gridfs/schemas';
import { EcgFinding } from '../enums';

export type ExamDocument = Exam & BaseDocument;

@Schema({ 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})
export class Exam extends BaseDocument {
  @ApiProperty({ description: 'The date when the exam was performed' })
  @Prop({ required: true })
  examDate: Date;

  @ApiProperty({ description: 'The patient age' })
  @Prop()
  age?: number;

  @ApiProperty({ description: 'sex of the patient' })
  @Prop()
  sex?: 'M' | 'F';

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

// Create indexes for better query performance
ExamSchema.index({ examDate: 1 });                   // Frequently queried field
ExamSchema.index({ dateOfBirth: 1 });                // Used for filtering
ExamSchema.index({ categories: 1 });                 // Used for filtering
ExamSchema.index({ isDeleted: 1 });                  // Used in all queries
ExamSchema.index({ 'ecgParameters.heartRate': 1 });  // For range queries
ExamSchema.index({ createdAt: -1 });                 // For sorting by newest
ExamSchema.index({ isDeleted: 1, examDate: -1 });    // Compound index for common query pattern
ExamSchema.index({ isDeleted: 1, categories: 1 });   // Compound index for filtering by categories
