import { BaseDocument } from '../schemas';
import { AbstractRepository } from '../repositories';
import { InternalServerErrorException } from '@nestjs/common';
import { LoggerService } from './logger.service';

export abstract class AbstractUpdaterService<
  T extends BaseDocument,
  UpdateDto extends Record<string, any>,
> {
  constructor(
    protected readonly repository: AbstractRepository<T>,
    protected readonly logger: LoggerService,
    protected readonly entityName: string,
  ) {}

  async update(id: string, updateDto: UpdateDto): Promise<T> {
    try {
      this.logger.logOperation('update', this.entityName, { id, ...updateDto });
      const result = await this.repository.update(id, updateDto);
      this.logger.logSuccess('update', this.entityName, result);
      return result;
    } catch (error) {
      this.logger.logError('update', this.entityName, error);
      throw new InternalServerErrorException(error);
    }
  }
}
