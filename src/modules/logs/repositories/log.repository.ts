import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Log, LogDocument } from '../schemas/log.schema';

@Injectable()
export class LogRepository {
  constructor(
    @InjectModel(Log.name) private readonly logModel: Model<LogDocument>,
  ) {}

  async create(logData: Partial<Log>): Promise<LogDocument> {
    const createdLog = new this.logModel(logData);
    return createdLog.save();
  }

  async findAll(filter = {}, options = {}): Promise<LogDocument[]> {
    return this.logModel.find(filter, null, options).exec();
  }

  async findById(id: string): Promise<LogDocument> {
    return this.logModel.findById(id).exec();
  }

  async findByUserId(userId: string): Promise<LogDocument[]> {
    return this.logModel.find({ userId }).exec();
  }

  async findByResource(resource: string): Promise<LogDocument[]> {
    return this.logModel.find({ resource }).exec();
  }

  async findBySuccess(success: boolean): Promise<LogDocument[]> {
    return this.logModel.find({ success }).exec();
  }
}
