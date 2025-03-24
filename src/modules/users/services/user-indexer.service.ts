import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { User } from '../../schemas/user.schema';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class UserIndexerService {
  private readonly logger = new Logger(UserIndexerService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async findAll(): Promise<User[]> {
    try {
      this.logger.log('Fetching all users');
      const users = await this.userRepository.find();
      this.logger.log(`Found ${users.length} users`);
      return users;
    } catch (error) {
      this.logger.error('Error fetching users', error.stack);
      throw new NotFoundException('Failed to fetch users');
    }
  }
}
