import { AbstractRepository } from '../repositories/abstract.repository';
import { LoggerService } from './logger.service';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BaseDocument } from '../schemas';

export abstract class AbstractDeleterService<T extends BaseDocument> {
  constructor(
    protected readonly repository: AbstractRepository<T>,
    protected readonly logger: LoggerService,
    protected readonly entityName: string,
  ) {}

  async delete(id: string): Promise<T> {
    try {
      this.logger.logOperation('delete', this.entityName, { id });
      const entity = await this.repository.findOne(id);
      await this.repository.delete(id);
      return entity;
    } catch (error) {
      this.logger.logError('delete', this.entityName, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error deleting ${this.entityName}`,
      );
    }
  }

  async hardDelete(id: string): Promise<T> {
    try {
      this.logger.logOperation('hardDelete', this.entityName, { id });
      const entity = await this.repository.findOne(id);
      if (!entity) {
        throw new NotFoundException(`${this.entityName} not found`);
      }
      await this.repository.hardDelete(id);
      return entity;
    } catch (error) {
      this.logger.logError('hardDelete', this.entityName, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error permanently deleting ${this.entityName}`,
      );
    }
  }
}
