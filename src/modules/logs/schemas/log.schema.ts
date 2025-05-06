import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LogDocument = Log & Document;

@Schema({
  timestamps: true,
  collection: 'logs',
})
export class Log {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  resource: string;

  @Prop({ required: true, type: Object })
  requestData: Record<string, any>;

  @Prop({ required: true })
  executionTime: number;

  @Prop({ required: true })
  success: boolean;

  @Prop()
  errorMessage?: string;

  @Prop()
  method: string;

  @Prop()
  endpoint: string;

  @Prop()
  ipAddress: string;
}

export const LogSchema = SchemaFactory.createForClass(Log);
