import { AbstractRepository } from '../repositories/abstract.repository';
import { LoggerService } from './logger.service';
import { InternalServerErrorException } from '@nestjs/common';
import { BaseDocument } from '../schemas';
import { PaginatedResponseDto, PaginationDto } from '../dto/pagination.dto';
import { FilterQuery } from 'mongoose';

export abstract class AbstractIndexerService<T extends BaseDocument> {
  constructor(
    protected readonly repository: AbstractRepository<T>,
    protected readonly logger: LoggerService,
    protected readonly entityName: string,
  ) {}

  async findAll(filter?: FilterQuery<T>): Promise<T[]> {
    try {
      this.logger.logOperation('findAll', this.entityName, filter);
      const results = await this.repository.findAll(filter);
      return results;
    } catch (error) {
      this.logger.logError('findAll', this.entityName, error);
      throw new InternalServerErrorException(
        `Error listing ${this.entityName}s`,
      );
    }
  }

  async findWithPagination(
    pagination: PaginationDto,
    filter?: FilterQuery<T>,
  ): Promise<PaginatedResponseDto<T>> {
    try {
      this.logger.logOperation('findWithPagination', this.entityName, {
        pagination,
        filter,
      });
      const results = await this.repository.findWithPagination(
        pagination,
        filter,
      );
      return results;
    } catch (error) {
      this.logger.logError('findWithPagination', this.entityName, error);
      throw new InternalServerErrorException(
        `Error listing paginated ${this.entityName}s`,
      );
    }
  }
}
