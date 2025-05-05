import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { EcgWaveType } from '../enums';

export class WaveDuration {
  @ApiProperty({ 
    enum: () => EcgWaveType, 
    description: 'Type of ECG wave or interval',
    enumName: 'EcgWaveType'
  })
  @Prop({ enum: EcgWaveType })
  wave: EcgWaveType;

  @ApiProperty({ description: 'Duration in milliseconds' })
  @Prop({ required: true })
  duration: number;
}
