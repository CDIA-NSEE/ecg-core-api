import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggerService extends Logger {
  logOperation(operation: string, entityName: string, data?: any): void {
    this.log(
      `Executing ${operation} on ${entityName}${
        data ? `: ${JSON.stringify(data)}` : ''
      }`,
    );
  }

  logError(operation: string, entityName: string, error: any): void {
    this.error(
      `Error in ${operation} on ${entityName}: ${error.message}`,
      error.stack,
    );
  }

  logSuccess(operation: string, entityName: string, result: any): void {
    this.log(
      `Success in ${operation} on ${entityName}: ${JSON.stringify(result)}`,
    );
  }
}
