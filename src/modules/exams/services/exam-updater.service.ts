import { Injectable, Inject } from '@nestjs/common';
import { ExamRepository } from '../repositories';
import { AbstractUpdaterService } from '../../../shared/common';
import { LoggerService } from '../../../shared/common/services/logger.service';
import { ExamDocument } from '../schemas/exam.schema';
import { UpdateExamDto } from '../dto/update-exam.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ExamFinderService } from './exam-finder.service';
import { ExamIndexerService } from './exam-indexer.service';

@Injectable()
export class ExamUpdaterService extends AbstractUpdaterService<
  ExamDocument,
  UpdateExamDto
> {
  constructor(
    private readonly examRepository: ExamRepository,
    logger: LoggerService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly examFinderService: ExamFinderService,
    private readonly examIndexerService: ExamIndexerService
  ) {
    super(examRepository, logger, 'Exam');
  }

  async update(id: string, updateDto: UpdateExamDto): Promise<ExamDocument> {
    const result = await super.update(id, updateDto);
    
    await Promise.all([
      this.examFinderService.invalidateCache(id),
      this.examIndexerService.invalidateCache()
    ]);
    
    return result;
  }
}
