import { Injectable } from '@nestjs/common';
import { AbstractCreatorService } from '../../../shared/common/services';
import { LoggerService } from '../../../shared/common/services/logger.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserRepository } from '../repositories';
import { UserDocument } from '../schemas/user.schema';

@Injectable()
export class UserCreatorService extends AbstractCreatorService<
  UserDocument,
  CreateUserDto
> {
  constructor(
    private readonly userRepository: UserRepository,
    logger: LoggerService,
  ) {
    super(userRepository, logger, 'User');
  }
}
