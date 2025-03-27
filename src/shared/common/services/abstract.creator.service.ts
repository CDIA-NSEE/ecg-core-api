import { BaseDocument } from '../schemas';
import { AbstractRepository } from '../repositories';
import { InternalServerErrorException } from '@nestjs/common';
import { LoggerService } from './logger.service';

export abstract class AbstractCreatorService<
  T extends BaseDocument,
  CreateDto extends Record<string, any>,
> {
  constructor(
    protected readonly repository: AbstractRepository<T>,
    protected readonly logger: LoggerService,
    protected readonly entityName: string,
  ) {}

  async create(createDto: CreateDto): Promise<T> {
    try {
      this.logger.logOperation('create', this.entityName, createDto);
      const result = await this.repository.create(createDto);
      return result;
    } catch (error) {
      this.logger.logError('create', this.entityName, error);
      throw new InternalServerErrorException(
        `Error creating ${this.entityName}`,
      );
    }
  }
}
