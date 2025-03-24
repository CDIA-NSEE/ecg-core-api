import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { User } from '../../schemas/user.schema';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class UserFinderService {
  private readonly logger = new Logger(UserFinderService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async findOne(username: string): Promise<User | null> {
    try {
      this.logger.log(`Searching for user with username: ${username}`);
      const user = await this.userRepository.findOne(username);
      if (user) {
        this.logger.log(`Found user: ${user.username}`);
      } else {
        this.logger.log(`No user found with username: ${username}`);
      }
      return user;
    } catch (error) {
      this.logger.error(`Error searching for user ${username}`, error.stack);
      throw new NotFoundException(`Failed to find user: ${username}`);
    }
  }
}
