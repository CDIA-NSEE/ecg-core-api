import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { User } from '../../schemas/user.schema';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class UserUpdaterService {
  private readonly logger = new Logger(UserUpdaterService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async update(username: string, updates: Partial<User>): Promise<User> {
    try {
      this.logger.log(`Updating user: ${username}`);
      const updatedUser = await this.userRepository.update(username, updates);
      if (!updatedUser) {
        throw new NotFoundException(`User not found: ${username}`);
      }
      this.logger.log(`Successfully updated user: ${username}`);
      return updatedUser;
    } catch (error) {
      this.logger.error(`Error updating user ${username}`, error.stack);
      throw new NotFoundException(`Failed to update user: ${username}`);
    }
  }
}
