import { Document, FilterQuery } from 'mongoose';
import { AbstractRepository } from '../repositories/abstract.repository';
import { LoggerService } from './logger.service';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

@Injectable()
export abstract class AbstractFinderService<T extends Document> {
  constructor(
    protected readonly repository: AbstractRepository<T>,
    protected readonly logger: LoggerService,
    protected readonly entityName: string,
  ) {}

  async findOne(id: string): Promise<T> {
    try {
      this.logger.logOperation('findOne', this.entityName, { id });
      const result = await this.repository.findById(id);
      if (!result) {
        throw new NotFoundException(`${this.entityName} not found`);
      }
      return result;
    } catch (error) {
      this.logger.logError('findOne', this.entityName, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Error finding ${this.entityName}`);
    }
  }
}
