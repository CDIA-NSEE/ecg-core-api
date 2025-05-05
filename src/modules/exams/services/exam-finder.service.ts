import { Injectable, Inject } from '@nestjs/common';
import { AbstractFinderService } from '../../../shared/common/services';
import { LoggerService } from '../../../shared/common/services/logger.service';
import { ExamRepository } from '../repositories';
import { ExamDocument } from '../schemas/exam.schema';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PaginationDto, PaginatedResponseDto } from '../../../shared/common/dto/pagination.dto';

@Injectable()
export class ExamFinderService extends AbstractFinderService<ExamDocument> {
  constructor(
    private readonly examRepository: ExamRepository,
    logger: LoggerService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {
    super(examRepository, logger, 'Exam');
  }

  async findOne(id: string): Promise<ExamDocument> {
    const cacheKey = `exam:${id}`;
    const cachedExam = await this.cacheManager.get<ExamDocument>(cacheKey);
    
    if (cachedExam) {
      this.logger.log(`Cache hit for exam ${id}`);
      return cachedExam;
    }

    const exam = await super.findOne(id);
    
    await this.cacheManager.set(cacheKey, exam, 300);
    
    return exam;
  }

  async findWithPagination(
    pagination: PaginationDto,
    filter: any = {},
  ): Promise<PaginatedResponseDto<ExamDocument>> {
    const cacheKey = `exams:page:${pagination.page}:limit:${pagination.limit}:filter:${JSON.stringify(filter)}`;
    
    const cachedResult = await this.cacheManager.get<PaginatedResponseDto<ExamDocument>>(cacheKey);
    
    if (cachedResult) {
      this.logger.log(`Cache hit for exams list with pagination ${pagination.page}/${pagination.limit}`);
      return cachedResult;
    }
    
    const result = await this.repository.findWithPagination(
      pagination,
      filter,
      { 
        _id: 1,
        examDate: 1,
        dateOfBirth: 1,
        categories: 1,
        report: 1,
        'ecgParameters.heartRate': 1,
        createdAt: 1,
        updatedAt: 1
      }
    );
    
    await this.cacheManager.set(cacheKey, result, 60);
    
    return result;
  }

  async invalidateCache(id: string): Promise<void> {
    await this.cacheManager.del(`exam:${id}`);
    const keys = await this.cacheManager.store.keys('exams:page:*');
    if (keys && keys.length) {
      await Promise.all(keys.map(key => this.cacheManager.del(key)));
    }
  }
}
