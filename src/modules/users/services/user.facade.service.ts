import { Injectable } from '@nestjs/common';
import { UserCreatorService } from './user-creator.service';
import { UserFinderService } from './user-finder.service';
import { UserUpdaterService } from './user-updater.service';
import { UserDeleterService } from './user-deleter.service';
import { UserIndexerService } from './user-indexer.service';
import { User } from '../../schemas/user.schema';

@Injectable()
export class UserFacadeService {
  constructor(
    private readonly creator: UserCreatorService,
    private readonly finder: UserFinderService,
    private readonly updater: UserUpdaterService,
    private readonly deleter: UserDeleterService,
    private readonly indexer: UserIndexerService,
  ) {}

  async create(user: User): Promise<User> {
    return this.creator.create(user);
  }

  async findOne(username: string): Promise<User | null> {
    return this.finder.findOne(username);
  }

  async findAll(): Promise<User[]> {
    return this.indexer.findAll();
  }

  async update(id: string, user: Partial<User>): Promise<User> {
    return this.updater.update(id, user);
  }

  async delete(id: string): Promise<void> {
    await this.deleter.delete(id);
  }
}
