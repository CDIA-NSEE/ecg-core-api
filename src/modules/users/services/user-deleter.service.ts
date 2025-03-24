import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { User } from '../../schemas/user.schema';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class UserDeleterService {
  private readonly logger = new Logger(UserDeleterService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async delete(username: string): Promise<void> {
    try {
      this.logger.log(`Deleting user: ${username}`);
      const result = await this.userRepository.delete(username);
      if (!result) {
        throw new NotFoundException(`User not found: ${username}`);
      }
      this.logger.log(`Successfully deleted user: ${username}`);
    } catch (error) {
      this.logger.error(`Error deleting user ${username}`, error.stack);
      throw new NotFoundException(`Failed to delete user: ${username}`);
    }
  }
}
