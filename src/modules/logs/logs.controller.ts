import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { LogService } from './services/log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('logs')
@UseGuards(JwtAuthGuard)
export class LogsController {
  constructor(private readonly logService: LogService) {}

  @Get()
  async findAll(@Query() query: any) {
    const filter = {};
    const options = {
      sort: { createdAt: -1 },
      limit: query.limit ? parseInt(query.limit) : 100,
      skip: query.skip ? parseInt(query.skip) : 0,
    };
    
    if (query.userId) filter['userId'] = query.userId;
    if (query.resource) filter['resource'] = query.resource;
    if (query.success !== undefined) filter['success'] = query.success === 'true';
    
    return this.logService.findAllLogs(filter, options);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.logService.findLogById(id);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.logService.findLogsByUserId(userId);
  }

  @Get('resource/:resource')
  async findByResource(@Param('resource') resource: string) {
    return this.logService.findLogsByResource(resource);
  }
}
