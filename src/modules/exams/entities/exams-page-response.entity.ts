import { ApiProperty } from '@nestjs/swagger';
import { PageResponseEntity } from '../../../shared/common/entities/page-response.entity';
import { ExamResponseEntity } from './exam-response.entity';
import { PaginationMetaDto } from '../../../shared/common/dto/pagination.dto';

export class ExamsPageResponseEntity extends PageResponseEntity<ExamResponseEntity> {
  @ApiProperty({ type: [ExamResponseEntity] })
  items: ExamResponseEntity[];

  constructor(items: ExamResponseEntity[], meta: PaginationMetaDto) {
    super(items, meta.total, meta.page, meta.limit);
  }
}
