import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export abstract class BaseDocument extends Document {
  @ApiProperty({
    description: 'When the document was deleted',
    required: false,
  })
  @Prop()
  deletedAt?: Date;

  @ApiProperty({ description: 'When the document was created' })
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @ApiProperty({ description: 'When the document was last updated' })
  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export type BaseSchema = BaseDocument;
