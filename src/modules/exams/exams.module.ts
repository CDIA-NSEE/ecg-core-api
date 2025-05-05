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
import { NativeGridFsRepository } from '../../shared/database/gridfs/repositories';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { GridFsModule } from '../../shared';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Exam.name, schema: ExamSchema }]),
    MulterModule.register({
      storage: memoryStorage(), // Use memory storage for processing files
    }),
    GridFsModule,
    // Import CacheModule with specific TTL for this module
    CacheModule.register({
      ttl: 300, // 5 minutes TTL for exam-specific caches
      max: 500, // Maximum number of items in cache
    }),
  ],
  providers: [
    ExamFacadeService,
    ExamRepository,
    ExamCreatorService,
    ExamFinderService,
    ExamUpdaterService,
    ExamDeleterService,
    ExamIndexerService,
    LoggerService,
  ],
  controllers: [ExamsController],
  exports: [ExamFacadeService, ExamRepository, LoggerService],
})
export class ExamsModule {}
