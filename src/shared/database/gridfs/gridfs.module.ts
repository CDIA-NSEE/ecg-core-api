import { Module } from '@nestjs/common';
import { GridFsService } from './gridfs.service';
import { GridFsRepository } from './repositories/gridfs.repository';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([])],
  providers: [GridFsService, GridFsRepository],
  exports: [GridFsService],
})
export class GridFsModule {}
