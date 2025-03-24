import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export class BaseSchema {
  @ApiProperty({ description: 'The unique identifier of the document' })
  @Prop()
  _id: string;

  @ApiProperty({ description: 'The creation date of the document' })
  @Prop()
  createdAt: Date;

  @ApiProperty({ description: 'The last update date of the document' })
  @Prop()
  updatedAt: Date;

  @ApiProperty({ description: 'The deletion date of the document' })
  @Prop({ default: null })
  deletedAt: Date | null;
}

export type BaseDocument = BaseSchema & Document;

export const BaseSchemaFactory = SchemaFactory.createForClass(BaseSchema);
