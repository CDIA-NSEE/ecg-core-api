import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { BaseDocument } from '../../../shared/common/schemas';

export type ExamDocument = Exam & BaseDocument;

@Schema({ timestamps: true })
export class Exam extends BaseDocument {
  @ApiProperty({ description: 'The date when the exam was performed' })
  @Prop({ required: true })
  examDate: Date;

  @ApiProperty({ description: 'The date of birth of the patient' })
  @Prop()
  dateOfBirth?: Date;

  @ApiProperty({ description: 'The URL of the exam image from GridFS' })
  @Prop()
  imageUrl?: string;

  @ApiProperty({ description: 'The amplitude of the ECG signal' })
  @Prop()
  amplitude?: number;

  @ApiProperty({ description: 'The velocity of the ECG signal' })
  @Prop()
  velocity?: number;

  @ApiProperty({ description: 'The medical report of the exam' })
  @Prop()
  report?: string;

  @ApiProperty({ description: 'Categories or tags for the exam' })
  @Prop({ type: [String], default: [] })
  categories?: string[];

  @ApiProperty({ description: 'The status of the exam' })
  @Prop({ default: 'pending', enum: ['pending', 'completed', 'canceled'] })
  status: string;
}

export const ExamSchema = SchemaFactory.createForClass(Exam);
