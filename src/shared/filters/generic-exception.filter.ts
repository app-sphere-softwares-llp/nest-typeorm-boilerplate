import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { HttpExceptionFilter } from '@/shared/filters/bad-request.filter';
import { QueryFailedFilter } from '@/shared/filters/query-failed.filter';
import { Response } from 'express';
import { STATUS_CODES } from 'http';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { QueryFailedError } from 'typeorm';
import { ErrorResponseModel } from '@/shared/models/error-response.model';
import { APP_INTERNAL_SERVER_ERROR } from '@/shared/constants/app.constant';

@Catch()
@Injectable()
export class GenericExceptionFilter implements ExceptionFilter {
  constructor(@Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger) {
  }

  catch(exception: any, host: ArgumentsHost): any {
    this.logger.error(exception, [{ stack: exception }]);

    if (exception instanceof HttpException) {
      new HttpExceptionFilter().catch(exception, host);
    } else if (exception instanceof QueryFailedError) {
      new QueryFailedFilter().catch(exception, host);
    } else {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();

      const errorResponse = new ErrorResponseModel();
      errorResponse.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

      if (exception instanceof Error) {
        errorResponse.message = APP_INTERNAL_SERVER_ERROR;
      } else {
        errorResponse.statusCode = exception.getStatus();
        errorResponse.message = exception.message;
      }

      errorResponse.error = STATUS_CODES[errorResponse.statusCode];

      response.status(errorResponse.statusCode).json(errorResponse);
    }
  }
}
