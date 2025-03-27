import { ApiProperty } from '@nestjs/swagger';
import { PageResponseEntity } from '../../../shared/common/entities/page-response.entity';
import { UserResponseEntity } from './user-response.entity';
import { PaginationMetaDto } from '../../../shared/common/dto/pagination.dto';

export class UsersPageResponseEntity extends PageResponseEntity<UserResponseEntity> {
  @ApiProperty({ type: [UserResponseEntity] })
  items: UserResponseEntity[];

  constructor(items: UserResponseEntity[], meta: PaginationMetaDto) {
    super(items, meta);
  }
}
