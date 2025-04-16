import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { PaginationDto, PaginatedResponseDto } from '../dto/pagination.dto';
import { BaseDocument } from '../schemas';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

export class RepositoryException extends Error {
  constructor(
    message: string,
    public error?: any,
  ) {
    super(message);
    this.name = 'RepositoryException';
  }
}

export class RepositoryConflictException extends Error {
  constructor(
    message: string,
public  error?: any,
  ) {
    super(message);
    this.name = 'RepositoryConflictException';
  }
}

export abstract class AbstractRepository<T extends BaseDocument> {
  constructor(protected readonly model: Model<T>) {}

  async create(createDto: any): Promise<T> {
    try {
      const created = new this.model(createDto);
      return await created.save();
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new BadRequestException('Validation failed', error);
      }
      throw new RepositoryException('Failed to create document', error);
    }
  }

  async findOne(id: string): Promise<T> {
    try {
      const document = await this.model.findById(id).exec();
      if (!document) {
        throw new NotFoundException('Document not found');
      }
      return document;
    } catch (error) {
      throw new RepositoryException('Failed to find document', error);
    }
  }

  async findAll(filter: FilterQuery<T> = {}): Promise<T[]> {
    try {
      return await this.model.find({ ...filter, isDeleted: false }).exec();
    } catch (error) {
      throw new RepositoryException('Failed to find documents', error);
    }
  }

  async update(id: string, updateDto: UpdateQuery<T>): Promise<T> {
    try {
      const updated = await this.model
        .findOneAndUpdate({ _id: id, isDeleted: false }, updateDto, {
          new: true,
        })
        .exec();
      if (!updated) {
        throw new NotFoundException('Document not found');
      }
      return updated;
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw new BadRequestException('Validation failed', error);
      }
      throw new RepositoryException('Failed to update document', error);
    }
  }

  async delete(id: string): Promise<T> {
    try {
      const deleted = await this.model
        .findByIdAndUpdate(
          id,
          { isDeleted: true, deletedAt: new Date() } as UpdateQuery<T>,
          { new: true },
        )
        .exec();
      if (!deleted) {
        throw new NotFoundException('Document not found');
      }
      return deleted;
    } catch (error) {
      throw new RepositoryException('Failed to delete document', error);
    }
  }

  async hardDelete(id: string): Promise<T> {
    try {
      const deleted = await this.model.findByIdAndDelete(id).exec();
      if (!deleted) {
        throw new NotFoundException('Document not found');
      }
      return deleted;
    } catch (error) {
      throw new RepositoryException('Failed to hard delete document', error);
    }
  }

  async findWithPagination(
    pagination: PaginationDto,
    filter: FilterQuery<T> = {},
  ): Promise<PaginatedResponseDto<T>> {
    try {
      const { page = 1, limit = 10 } = pagination;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.model
          .find({ ...filter, isDeleted: false })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.model.countDocuments({ ...filter, isDeleted: false }).exec(),
      ]);

      const lastPage = Math.ceil(total / limit);

      return {
        data,
        meta: {
          total,
          page,
          limit,
          lastPage,
          hasNextPage: page < lastPage,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      throw new RepositoryException('Failed to fetch paginated data', error);
    }
  }
}
