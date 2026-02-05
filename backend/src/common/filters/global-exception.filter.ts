import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const type = host.getType();

    if (type === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      
      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Internal server error';
      let errorSources: any[] = [];
  
      if (exception instanceof HttpException) {
        statusCode = exception.getStatus();
        const res = exception.getResponse() as any;
        message = typeof res === 'string' ? res : res.message || 'Error';
        errorSources = res.errorSources || [
          {
            path: '',
            message: message,
          },
        ];
      } else if (exception instanceof Error) {
        message = exception.message;
        errorSources = [
          {
            path: '',
            message: exception.message,
          },
        ];
      }
  
      const responseBody = {
        success: false,
        message,
        errorSources,
        stack: process.env.NODE_ENV === 'development' ? exception?.stack : null,
      };
  
      response.status(statusCode).json(responseBody);
    } else {
      // GraphQL or RPC, etc. Let the default handling take over or just return the exception
      throw exception;
    }
  }
}
