import { Injectable, Inject } from '@nestjs/common';
import { ExamRepository } from '../repositories/exam.repository';
import { ExamDocument } from '../schemas/exam.schema';
import { LoggerService } from '../../../shared/common/services/logger.service';
import { AbstractDeleterService } from '../../../shared/common/services';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ExamFinderService } from './exam-finder.service';
import { ExamIndexerService } from './exam-indexer.service';

@Injectable()
export class ExamDeleterService extends AbstractDeleterService<ExamDocument> {
  constructor(
    private readonly examRepository: ExamRepository,
    logger: LoggerService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly examFinderService: ExamFinderService,
    private readonly examIndexerService: ExamIndexerService
  ) {
    super(examRepository, logger, 'Exam');
  }

  /**
   * Delete an exam and invalidate all related caches
   * @param id The exam ID
   * @returns The deleted exam
   */
  async delete(id: string): Promise<ExamDocument> {
    // Delete the exam in the database (soft delete)
    const result = await super.delete(id);
    
    // Invalidate all related caches
    await Promise.all([
      // Invalidate the individual exam cache
      this.examFinderService.invalidateCache(id),
      
      // Invalidate the indexer caches (for listings)
      this.examIndexerService.invalidateCache()
    ]);
    
    return result;
  }

  /**
   * Hard delete an exam and invalidate all related caches
   * @param id The exam ID
   * @returns The deleted exam
   */
  async hardDelete(id: string): Promise<ExamDocument> {
    // Hard delete the exam from the database
    const result = await super.hardDelete(id);
    
    // Invalidate all related caches
    await Promise.all([
      // Invalidate the individual exam cache
      this.examFinderService.invalidateCache(id),
      
      // Invalidate the indexer caches (for listings)
      this.examIndexerService.invalidateCache()
    ]);
    
    return result;
  }
}
