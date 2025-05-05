import { Prop, Schema } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { EcgWaveType } from "../enums";

export class WaveAxis {
	@ApiProperty({ 
		description: "The wave type",
		enum: () => EcgWaveType,
		enumName: 'EcgWaveType'
	})
	@Prop({ enum: EcgWaveType })
	wave: EcgWaveType;

	@ApiProperty({ description: "The axis value" })
	@Prop()
	value: number;
}
