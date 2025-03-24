import { ApiProperty } from '@nestjs/swagger';

export class BaseEntity {
  @ApiProperty({ description: 'The unique identifier' })
  id: string;

  @ApiProperty({ description: 'The creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'The last update date' })
  updatedAt: Date;

  @ApiProperty({ description: 'Whether the entity is deleted (soft delete)' })
  isDeleted: boolean;

  constructor(partial?: Partial<BaseEntity>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
