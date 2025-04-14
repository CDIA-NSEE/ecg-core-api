import { Injectable } from '@nestjs/common';
import { AbstractFinderService } from '../../../shared/common/services';
import { LoggerService } from '../../../shared/common/services/logger.service';
import { ExamRepository } from '../repositories';
import { ExamDocument } from '../schemas/exam.schema';

@Injectable()
export class ExamFinderService extends AbstractFinderService<ExamDocument> {
  constructor(
    private readonly examRepository: ExamRepository,
    logger: LoggerService,
  ) {
    super(examRepository, logger, 'Exam');
  }
}
