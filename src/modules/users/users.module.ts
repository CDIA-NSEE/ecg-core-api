import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UserFacadeService } from './services/user.facade.service';
import { UserRepository } from './repositories/user.repository';
import { User, UserSchema } from './schemas/user.schema';
import { UserCreatorService } from './services/user-creator.service';
import { UserFinderService } from './services/user-finder.service';
import { UserUpdaterService } from './services/user-updater.service';
import { UserDeleterService } from './services/user-deleter.service';
import { UserIndexerService } from './services/user-indexer.service';
import { LoggerService } from '../../shared/common/services/logger.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [
    UserFacadeService,
    UserRepository,
    {
      provide: 'UserCreatorService',
      useClass: UserCreatorService,
    },
    {
      provide: 'UserFinderService',
      useClass: UserFinderService,
    },
    {
      provide: 'UserUpdaterService',
      useClass: UserUpdaterService,
    },
    {
      provide: 'UserDeleterService',
      useClass: UserDeleterService,
    },
    {
      provide: 'UserIndexerService',
      useClass: UserIndexerService,
    },
    LoggerService,
  ],
  controllers: [UsersController],
  exports: [UserFacadeService, UserRepository, LoggerService],
})
export class UsersModule {}
