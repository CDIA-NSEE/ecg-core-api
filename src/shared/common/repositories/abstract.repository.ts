import { Document, FilterQuery, Model, UpdateQuery } from 'mongoose';
import { PaginationDto, PaginatedResponseDto } from '../dto/pagination.dto';
import { BaseSchema } from '../schemas';
import { NotFoundException } from '@nestjs/common';

export abstract class AbstractRepository<T extends Document & BaseSchema> {
  constructor(protected readonly model: Model<T>) {}

  async create(createDto: any): Promise<T> {
    const created = new this.model(createDto);
    return created.save();
  }

  async findOne(id: string): Promise<T> {
    const document = await this.model.findById(id).exec();
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return document;
  }

  async findAll(filter: FilterQuery<T> = {}): Promise<T[]> {
    return this.model.find({ ...filter, isDeleted: false }).exec();
  }

  async update(id: string, updateDto: UpdateQuery<T>): Promise<T> {
    const updated = await this.model
      .findOneAndUpdate({ _id: id, isDeleted: false }, updateDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException('Document not found');
    }
    return updated;
  }

  async delete(id: string): Promise<T> {
    const deleted = await this.model.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() } as UpdateQuery<T>,
      { new: true },
    ).exec();
    if (!deleted) {
      throw new NotFoundException('Document not found');
    }
    return deleted;
  }

  async hardDelete(id: string): Promise<T> {
    const deleted = await this.model.findByIdAndDelete(id).exec();
    if (!deleted) {
      throw new NotFoundException('Document not found');
    }
    return deleted;
  }

  async findWithPagination(
    pagination: PaginationDto,
    filter: FilterQuery<T> = {},
  ): Promise<PaginatedResponseDto<T>> {
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
        lastPage,
        hasNextPage: page < lastPage,
        hasPreviousPage: page > 1,
      },
    };
  }
}
