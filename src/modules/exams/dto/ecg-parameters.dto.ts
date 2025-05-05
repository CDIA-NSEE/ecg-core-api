import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { WaveDuration } from '../schemas/wave-duration.schema';
import { WaveAxis } from '../schemas/wave-axis.schema';

export class EcgParametersDto {
  @ApiProperty({ description: 'Heart rate in beats per minute', example: 72 })
  @IsNumber()
  @IsOptional()
  heartRate?: number;

  @ApiProperty({ 
    description: 'Wave durations for different ECG waves',
    type: () => [WaveDuration] // Use lazy loading with a function
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WaveDuration)
  @IsOptional()
  durations?: WaveDuration[];

  @ApiProperty({ 
    description: 'Wave axes for different ECG waves',
    type: () => [WaveAxis] // Use lazy loading with a function
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WaveAxis)
  @IsOptional()
  axes?: WaveAxis[];
}
