import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories';
import { AbstractUpdaterService } from '../../../shared/common';
import { LoggerService } from '../../../shared/common/services/logger.service';
import { UserDocument } from '../schemas/user.schema';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserUpdaterService extends AbstractUpdaterService<
  UserDocument,
  UpdateUserDto
> {
  constructor(
    private readonly userRepository: UserRepository,
    logger: LoggerService,
  ) {
    super(userRepository, logger, 'User');
  }
}
