import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { BaseDocument } from '../../../shared/common/schemas';

export type UserDocument = User & BaseDocument;

@Schema({ timestamps: true })
export class User extends BaseDocument {
  @ApiProperty({ description: 'The username of the user' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ description: 'The email of the user' })
  @Prop({ required: true, unique: true })
  email: string;

  @ApiProperty({ description: 'The password of the user' })
  @Prop()
  password?: string;

  @ApiProperty({ description: 'The CRM of the user' })
  @Prop()
  crm: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
