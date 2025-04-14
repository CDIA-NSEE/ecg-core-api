import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class FindOneDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @IsMongoId()
    id: string;
}
