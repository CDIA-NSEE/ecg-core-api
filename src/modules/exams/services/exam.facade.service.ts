import { Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { ExamDocument } from '../schemas/exam.schema';
import { CreateExamDto } from '../dto/create-exam.dto';
import { UpdateExamDto } from '../dto/update-exam.dto';
import { ExamCreatorService } from './exam-creator.service';
import { ExamFinderService } from './exam-finder.service';
import { ExamUpdaterService } from './exam-updater.service';
import { ExamDeleterService } from './exam-deleter.service';
import { ExamIndexerService } from './exam-indexer.service';
import { PaginationDto } from '../../../shared/common/dto/pagination.dto';
import { ExamResponseEntity, ExamsPageResponseEntity } from '../entities';
import { CreateExamWithFileDto } from '../dto/create-exam-with-file.dto';

@Injectable()
export class ExamFacadeService {
  constructor(
    private readonly creator: ExamCreatorService,
    private readonly finder: ExamFinderService,
    private readonly updater: ExamUpdaterService,
    private readonly deleter: ExamDeleterService,
    private readonly indexer: ExamIndexerService,
  ) {}

  async create(createExamDto: CreateExamDto): Promise<ExamResponseEntity> {
    const exam = await this.creator.create(createExamDto);
    return ExamResponseEntity.fromEntity(exam);
  }

  async createWithFile(formData: CreateExamWithFileDto): Promise<ExamResponseEntity> {
    const exam = await this.creator.createWithFile(formData);
    return ExamResponseEntity.fromEntity(exam);
  }

  async findAll(
    filter?: FilterQuery<ExamDocument>,
  ): Promise<ExamResponseEntity[]> {
    const exams = await this.indexer.findAll(filter);
    return ExamResponseEntity.fromEntities(exams);
  }

  async findWithPagination(
    pagination: PaginationDto,
    filter?: FilterQuery<ExamDocument>,
  ): Promise<ExamsPageResponseEntity> {
    const { data, meta } = await this.indexer.findWithPagination(
      pagination,
      filter,
    );

    const examEntities = ExamResponseEntity.fromEntities(data);
    return new ExamsPageResponseEntity(examEntities, meta);
  }

  async findOne(id: string): Promise<ExamResponseEntity> {
    const exam = await this.finder.findOne(id);
    return ExamResponseEntity.fromEntity(exam);
  }

  async update(
    id: string,
    updateExamDto: UpdateExamDto,
  ): Promise<ExamResponseEntity> {
    const exam = await this.updater.update(id, updateExamDto);
    return ExamResponseEntity.fromEntity(exam);
  }

  async delete(id: string): Promise<ExamResponseEntity> {
    const exam = await this.deleter.delete(id);
    return ExamResponseEntity.fromEntity(exam);
  }

  async hardDelete(id: string): Promise<ExamResponseEntity> {
    const exam = await this.deleter.hardDelete(id);
    return ExamResponseEntity.fromEntity(exam);
  }
}
