import { PaginationDto } from "../../../shared";
import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsEnum, IsMongoId, IsArray, IsString, IsNumber, Min, Max, IsDateString } from "class-validator";
import { Type } from "class-transformer";
import { Types } from "mongoose";

export class FindMultipleExamsDto extends PaginationDto {
  @ApiProperty({ description: 'Search by title, description or laudo' })
  @IsOptional()
  search?: string;

  @ApiProperty({ 
    description: 'Filter by status', 
    enum: ['pending', 'completed', 'canceled'],
    required: false
  })
  @IsEnum(['pending', 'completed', 'canceled'])
  @IsOptional()
  status?: string;

  @ApiProperty({ 
    description: 'Filter by user ID', 
    required: false,
    example: '6071f2e7c4c1b40b9c9b2c9a'
  })
  @IsMongoId()
  @IsOptional()
  userId?: Types.ObjectId;

  @ApiProperty({ 
    description: 'Filter by patient ID', 
    required: false,
    example: '6071f2e7c4c1b40b9c9b2c9b'
  })
  @IsMongoId()
  @IsOptional()
  patientId?: Types.ObjectId;

  @ApiProperty({ 
    description: 'Filter by date of birth (from)', 
    required: false,
    example: '1980-01-01'
  })
  @IsDateString()
  @IsOptional()
  dateOfBirthFrom?: string;

  @ApiProperty({ 
    description: 'Filter by date of birth (to)', 
    required: false,
    example: '2000-01-01'
  })
  @IsDateString()
  @IsOptional()
  dateOfBirthTo?: string;

  @ApiProperty({ 
    description: 'Filter by minimum amplitude', 
    required: false,
    example: 1.0
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minAmplitude?: number;

  @ApiProperty({ 
    description: 'Filter by maximum amplitude', 
    required: false,
    example: 2.0
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  maxAmplitude?: number;

  @ApiProperty({ 
    description: 'Filter by minimum velocity', 
    required: false,
    example: 20
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minVelocity?: number;

  @ApiProperty({ 
    description: 'Filter by maximum velocity', 
    required: false,
    example: 30
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  maxVelocity?: number;

  @ApiProperty({ 
    description: 'Filter by categories (matches any)', 
    required: false,
    example: ['cardiac', 'routine'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categories?: string[];
}
