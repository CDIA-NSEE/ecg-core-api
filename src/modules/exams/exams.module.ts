import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExamsController } from './exams.controller';
import { ExamFacadeService } from './services/exam.facade.service';
import { ExamRepository } from './repositories/exam.repository';
import { Exam, ExamSchema } from './schemas/exam.schema';
import { ExamCreatorService } from './services/exam-creator.service';
import { ExamFinderService } from './services/exam-finder.service';
import { ExamUpdaterService } from './services/exam-updater.service';
import { ExamDeleterService } from './services/exam-deleter.service';
import { ExamIndexerService } from './services/exam-indexer.service';
import { LoggerService } from '../../shared/common/services/logger.service';
import { GridFsService } from '../../shared/database/gridfs/gridfs.service';
import { GridFsRepository } from '../../shared/database/gridfs/repositories/gridfs.repository';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Exam.name, schema: ExamSchema }]),
    MulterModule.register({
      storage: memoryStorage(), // Use memory storage for processing files
    }),
  ],
  providers: [
    ExamFacadeService,
    ExamRepository,
    {
      provide: 'ExamCreatorService',
      useClass: ExamCreatorService,
    },
    {
      provide: 'ExamFinderService',
      useClass: ExamFinderService,
    },
    {
      provide: 'ExamUpdaterService',
      useClass: ExamUpdaterService,
    },
    {
      provide: 'ExamDeleterService',
      useClass: ExamDeleterService,
    },
    {
      provide: 'ExamIndexerService',
      useClass: ExamIndexerService,
    },
    LoggerService,
    GridFsService,
    GridFsRepository,
  ],
  controllers: [ExamsController],
  exports: [ExamFacadeService, ExamRepository, LoggerService],
})
export class ExamsModule {}
