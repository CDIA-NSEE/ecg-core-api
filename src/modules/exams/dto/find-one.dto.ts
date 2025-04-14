import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsMongoId } from 'class-validator';

export class FindOneDto {
    @ApiProperty({ description: 'The ID of the exam', example: '6071f2e7c4c1b40b9c9b2c9a' })
    @IsMongoId()
    id: string;
}
