import { Injectable } from '@nestjs/common';
import { ExamRepository } from '../repositories';
import { AbstractUpdaterService } from '../../../shared/common';
import { LoggerService } from '../../../shared/common/services/logger.service';
import { ExamDocument } from '../schemas/exam.schema';
import { UpdateExamDto } from '../dto/update-exam.dto';

@Injectable()
export class ExamUpdaterService extends AbstractUpdaterService<
  ExamDocument,
  UpdateExamDto
> {
  constructor(
    private readonly examRepository: ExamRepository,
    logger: LoggerService,
  ) {
    super(examRepository, logger, 'Exam');
  }
}
