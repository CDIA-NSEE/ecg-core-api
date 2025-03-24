import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { BaseSchema } from '../../../shared/common/schemas';

export type BookDocument = Book & Document;

@Schema({ timestamps: true })
export class Book implements BaseSchema {
  @ApiProperty({ description: 'The unique identifier of the book' })
  _id: string;

  @ApiProperty({ description: 'The title of the book' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ description: 'The author of the book' })
  @Prop({ required: true })
  author: string;

  @ApiProperty({ description: 'The publication year of the book' })
  @Prop()
  year?: number;

  @ApiProperty({ description: 'The description of the book' })
  @Prop()
  description?: string;

  @ApiProperty({ description: 'Whether the book is deleted (soft delete)' })
  @Prop({ default: false })
  isDeleted: boolean;

  @ApiProperty({ description: 'The creation date of the book' })
  createdAt: Date;

  @ApiProperty({ description: 'The last update date of the book' })
  updatedAt: Date;
}

export const BookSchema = SchemaFactory.createForClass(Book);
