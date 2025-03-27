import { Injectable } from '@nestjs/common';
import { AbstractIndexerService } from '../../../shared/common/services';
import { LoggerService } from '../../../shared/common/services/logger.service';
import { UserDocument } from '../schemas/user.schema';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UserIndexerService extends AbstractIndexerService<UserDocument> {
  constructor(
    private readonly userRepository: UserRepository,
    logger: LoggerService,
  ) {
    super(userRepository, logger, 'User');
  }
}
