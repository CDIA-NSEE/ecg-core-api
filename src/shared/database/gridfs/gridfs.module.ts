import { Module } from '@nestjs/common';
import { GridFsService } from './gridfs.service';
import { NativeGridFsRepository } from './repositories/native-gridfs.repository';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([])],
  providers: [GridFsService, NativeGridFsRepository],
  exports: [GridFsService],
})
export class GridFsModule {}
