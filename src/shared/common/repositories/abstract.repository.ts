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

  async findOne(id: string, projection?: Record<string, any>): Promise<T> {
    try {
      const document = await this.model.findById(id)
        .select(projection || {})
        .lean()
        .exec();
      if (!document) {
        throw new NotFoundException('Document not found');
      }
      return document as T;
    } catch (error) {
      throw new RepositoryException('Failed to find document', error);
    }
  }

  async findAll(filter: FilterQuery<T> = {}, projection?: Record<string, any>): Promise<T[]> {
    try {
      return await this.model.find({ ...filter, isDeleted: false })
        .select(projection || {})
        .lean()
        .exec() as T[];
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
        .lean()
        .exec();
      if (!updated) {
        throw new NotFoundException('Document not found');
      }
      return updated as T;
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
        .lean()
        .exec();
      if (!deleted) {
        throw new NotFoundException('Document not found');
      }
      return deleted as T;
    } catch (error) {
      throw new RepositoryException('Failed to delete document', error);
    }
  }

  async hardDelete(id: string): Promise<T> {
    try {
      const deleted = await this.model.findByIdAndDelete(id).lean().exec();
      if (!deleted) {
        throw new NotFoundException('Document not found');
      }
      return deleted as T;
    } catch (error) {
      throw new RepositoryException('Failed to hard delete document', error);
    }
  }

  async findWithPagination(
    pagination: PaginationDto,
    filter: FilterQuery<T> = {},
    projection?: Record<string, any>,
    sort: Record<string, 1 | -1> = { createdAt: -1 }
  ): Promise<PaginatedResponseDto<T>> {
    try {
      const { page = 1, limit = 10 } = pagination;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.model
          .find({ ...filter, isDeleted: false })
          .select(projection || {})
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        this.model.countDocuments({ ...filter, isDeleted: false }).exec(),
      ]);

      const lastPage = Math.ceil(total / limit);

      return {
        data: data as T[],
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

  // Add cursor-based pagination for better performance with large datasets
  async findWithCursorPagination(
    cursorId: string | null,
    limit: number = 10,
    filter: FilterQuery<T> = {},
    projection?: Record<string, any>,
    sortField: string = '_id'
  ): Promise<{ data: T[]; nextCursor: string | null }> {
    try {
      const query: FilterQuery<T> = { ...filter, isDeleted: false };
      
      // If cursor ID is provided, find documents after that ID
      if (cursorId) {
        query._id = { $gt: cursorId };
      }
      
      // Fetch one more than requested to determine if there are more results
      const data = await this.model
        .find(query)
        .select(projection || {})
        .sort({ [sortField]: 1 })
        .limit(limit + 1)
        .lean()
        .exec();
      
      // Check if there are more results
      const hasMore = data.length > limit;
      const results = hasMore ? data.slice(0, limit) : data;
      
      // Return the next cursor if there are more results
      const nextCursor = hasMore && results.length > 0 
        ? String(results[results.length - 1]._id) 
        : null;
      
      return {
        data: results as T[],
        nextCursor,
      };
    } catch (error) {
      throw new RepositoryException('Failed to fetch data with cursor pagination', error);
    }
  }

  // Add bulk operations for better performance
  async bulkCreate(documents: any[]): Promise<T[]> {
    try {
      return await this.model.insertMany(documents) as T[];
    } catch (error) {
      throw new RepositoryException('Failed to bulk create documents', error);
    }
  }

  async bulkUpdate(criteria: any[], updates: any[]): Promise<any> {
    try {
      if (criteria.length !== updates.length) {
        throw new BadRequestException('Criteria and updates arrays must have the same length');
      }

      const bulkOps = criteria.map((criterion, index) => ({
        updateOne: {
          filter: { ...criterion, isDeleted: false },
          update: updates[index],
        },
      }));
      
      return await this.model.bulkWrite(bulkOps);
    } catch (error) {
      throw new RepositoryException('Failed to bulk update documents', error);
    }
  }
}
