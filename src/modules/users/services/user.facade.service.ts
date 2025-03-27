import { Injectable } from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserCreatorService } from './user-creator.service';
import { UserFinderService } from './user-finder.service';
import { UserUpdaterService } from './user-updater.service';
import { UserDeleterService } from './user-deleter.service';
import { UserIndexerService } from './user-indexer.service';
import { PaginationDto } from '../../../shared/common/dto/pagination.dto';
import { UserResponseEntity, UsersPageResponseEntity } from '../entities';

@Injectable()
export class UserFacadeService {
  constructor(
    private readonly creator: UserCreatorService,
    private readonly finder: UserFinderService,
    private readonly updater: UserUpdaterService,
    private readonly deleter: UserDeleterService,
    private readonly indexer: UserIndexerService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseEntity> {
    const user = await this.creator.create(createUserDto);
    return UserResponseEntity.fromEntity(user);
  }

  async findAll(
    filter?: FilterQuery<UserDocument>,
  ): Promise<UserResponseEntity[]> {
    const users = await this.indexer.findAll(filter);
    return UserResponseEntity.fromEntities(users);
  }

  async findWithPagination(
    pagination: PaginationDto,
    filter?: FilterQuery<UserDocument>,
  ): Promise<UsersPageResponseEntity> {
    const { data, meta } = await this.indexer.findWithPagination(
      pagination,
      filter,
    );

    const userEntities = UserResponseEntity.fromEntities(data);
    return new UsersPageResponseEntity(userEntities, meta);
  }

  async findOne(id: string): Promise<UserResponseEntity> {
    const user = await this.finder.findOne(id);
    return UserResponseEntity.fromEntity(user);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseEntity> {
    const user = await this.updater.update(id, updateUserDto);
    return UserResponseEntity.fromEntity(user);
  }

  async delete(id: string): Promise<UserResponseEntity> {
    const user = await this.deleter.delete(id);
    return UserResponseEntity.fromEntity(user);
  }

  async hardDelete(id: string): Promise<UserResponseEntity> {
    const user = await this.deleter.hardDelete(id);
    return UserResponseEntity.fromEntity(user);
  }
}
