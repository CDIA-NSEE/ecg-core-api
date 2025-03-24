import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { User } from '../../schemas/user.schema';
import { BadRequestException } from '@nestjs/common';
import { AbstractCreatorService } from '../../../shared/common/services';
import { UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class UserCreatorService extends AbstractCreatorService<UserDocument, CreateUserDto> {
  private readonly logger = new Logger(UserCreatorService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async create(user: User): Promise<User> {
    try {
      this.logger.log(`Creating new user: ${user.username}`);
      const createdUser = await this.userRepository.create(user);
      this.logger.log(`Successfully created user: ${createdUser.username}`);
      return createdUser;
    } catch (error) {
      this.logger.error(`Error creating user ${user.username}`, error.stack);
      throw new BadRequestException(`Failed to create user: ${user.username}`);
    }
  }
}
