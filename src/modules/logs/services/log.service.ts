import { Injectable } from '@nestjs/common';
import { LogRepository } from '../repositories/log.repository';
import { Log } from '../schemas/log.schema';

@Injectable()
export class LogService {
  constructor(private readonly logRepository: LogRepository) {}

  async logActivity(
    userId: string,
    resource: string,
    requestData: Record<string, any>,
    executionTime: number,
    success: boolean,
    method?: string,
    endpoint?: string,
    errorMessage?: string,
  ): Promise<Log> {
    const logData: Partial<Log> = {
      userId,
      resource,
      requestData,
      executionTime,
      success,
      method,
      endpoint,
      errorMessage,
    };

    return this.logRepository.create(logData);
  }

  async findAllLogs(filter = {}, options = {}): Promise<Log[]> {
    return this.logRepository.findAll(filter, options);
  }

  async findLogById(id: string): Promise<Log> {
    return this.logRepository.findById(id);
  }

  async findLogsByUserId(userId: string): Promise<Log[]> {
    return this.logRepository.findByUserId(userId);
  }

  async findLogsByResource(resource: string): Promise<Log[]> {
    return this.logRepository.findByResource(resource);
  }

  async findLogsBySuccess(success: boolean): Promise<Log[]> {
    return this.logRepository.findBySuccess(success);
  }
}
