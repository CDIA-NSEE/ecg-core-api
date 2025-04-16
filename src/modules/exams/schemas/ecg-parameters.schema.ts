import { Prop, Schema } from "@nestjs/mongoose";
import { WaveDuration } from "./wave-duration.schema";
import { WaveAxis } from "./wave-axis.schema";
import { ApiProperty } from "@nestjs/swagger";

export class EcgParameters {
	@ApiProperty({ description: 'Heart rate' })
	@Prop({ required: false })
	heartRate?: number;

	@ApiProperty({ description: 'Wave durations' })
	@Prop({ type: [WaveDuration], required: false })
	durations?: WaveDuration[];

	@ApiProperty({ description: 'Wave axes' })
	@Prop({ type: [WaveAxis], required: false })
	axes?: WaveAxis[];
}
