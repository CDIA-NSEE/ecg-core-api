import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LogService } from '../services/log.service';
import { Request as ExpressRequest, Response } from 'express';

// Extend the Express Request type to include the user property
interface Request extends ExpressRequest {
  user?: {
    userId?: string;  
    [key: string]: any;
  };
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logService: LogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body, params, query, user } = request;
    
    // Extract userId from the user object, matching JWT strategy's format
    const userId = user?.userId || 'anonymous';

    // Extract resource from URL (e.g., /api/users -> users)
    const urlParts = url.split('/');
    const resource = urlParts[urlParts.length - 1].split('?')[0] || urlParts[urlParts.length - 2] || 'unknown';

    // Combine request data
    const requestData = {
      body,
      params,
      query,
    };

    return next.handle().pipe(
      tap({
        next: (data) => {
          // Success case
          const executionTime = Date.now() - startTime;
          this.logService.logActivity(
            userId,
            resource,
            requestData,
            executionTime,
            true,
            method,
            url
          );
        },
        error: (error) => {
          // Error case
          const executionTime = Date.now() - startTime;
          this.logService.logActivity(
            userId,
            resource,
            requestData,
            executionTime,
            false,
            method,
            url,
            error.message
          );
        },
      }),
    );
  }
}
