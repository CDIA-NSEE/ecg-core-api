import { Injectable } from '@nestjs/common';
import { ExamRepository } from '../repositories/exam.repository';
import { ExamDocument } from '../schemas/exam.schema';
import { LoggerService } from '../../../shared/common/services/logger.service';
import { AbstractDeleterService } from '../../../shared/common/services';

@Injectable()
export class ExamDeleterService extends AbstractDeleterService<ExamDocument> {
  constructor(
    private readonly examRepository: ExamRepository,
    logger: LoggerService,
  ) {
    super(examRepository, logger, 'Exam');
  }
}
