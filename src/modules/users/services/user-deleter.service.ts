import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { UserDocument } from '../schemas/user.schema';
import { LoggerService } from '../../../shared/common/services/logger.service';
import { AbstractDeleterService } from '../../../shared/common/services';

@Injectable()
export class UserDeleterService extends AbstractDeleterService<UserDocument> {
  constructor(
    private readonly userRepository: UserRepository,
    logger: LoggerService,
  ) {
    super(userRepository, logger, 'User');
  }
}
