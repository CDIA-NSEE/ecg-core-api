import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class BaseDocument extends Document {
  @ApiProperty({ description: 'Whether the document is deleted (soft delete)', default: false })
  @Prop({ default: false })
  isDeleted: boolean;

  @ApiProperty({ description: 'When the document was deleted', required: false })
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
