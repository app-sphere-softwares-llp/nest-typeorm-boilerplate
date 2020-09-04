import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { STATUS_CODES } from 'http';
import { QueryFailedError } from 'typeorm';

import { constraintErrors } from './constraint-errors';
import { APP_INTERNAL_SERVER_ERROR } from '@/shared/constants/app.constant';

@Catch(QueryFailedError)
export class QueryFailedFilter implements ExceptionFilter {
  constructor() {
    //
  }

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorMessage = constraintErrors[exception.constraint] || APP_INTERNAL_SERVER_ERROR;

    const status =
      exception.constraint && exception.constraint.startsWith('UQ')
        ? HttpStatus.CONFLICT
        : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      statusCode: status,
      error: STATUS_CODES[status],
      message: errorMessage,
    });
  }
}
