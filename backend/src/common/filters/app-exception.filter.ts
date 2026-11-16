import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { AppError, AppErrorCode } from '../errors/app.error';

const APP_ERROR_STATUS: Record<AppErrorCode, number> = {
  bad_request: HttpStatus.BAD_REQUEST,
  not_found: HttpStatus.NOT_FOUND,
  forbidden: HttpStatus.FORBIDDEN,
  rate_limited: HttpStatus.TOO_MANY_REQUESTS,
  timeout: HttpStatus.GATEWAY_TIMEOUT,
  unavailable: HttpStatus.BAD_GATEWAY,
  bad_response: HttpStatus.BAD_GATEWAY,
};

export type ErrorResponseBody = {
  statusCode: number;
  code: string;
  message: string;
};

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const body = this.toErrorBody(exception);

    if (body.statusCode >= 500) {
      this.logger.error(
        body.message,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(body.statusCode).json(body);
  }

  private toErrorBody(exception: unknown): ErrorResponseBody {
    if (exception instanceof AppError) {
      return {
        statusCode: APP_ERROR_STATUS[exception.code],
        code: exception.code,
        message: exception.message,
      };
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : this.messageFromHttpResponse(exceptionResponse);

      return {
        statusCode,
        code: this.codeFromStatus(statusCode),
        message,
      };
    }

    return {
      statusCode: 500,
      code: 'unavailable',
      message: 'An unexpected error occurred.',
    };
  }

  private messageFromHttpResponse(exceptionResponse: string | object): string {
    if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null &&
      'message' in exceptionResponse
    ) {
      const message = exceptionResponse.message;
      if (typeof message === 'string') {
        return message;
      }
      if (Array.isArray(message)) {
        return message.map(String).join(', ');
      }
    }

    return 'Request failed.';
  }

  private codeFromStatus(statusCode: number): string {
    if (statusCode === 400) {
      return 'bad_request';
    }
    if (statusCode === 404) {
      return 'not_found';
    }
    if (statusCode === 403) {
      return 'forbidden';
    }
    if (statusCode === 429) {
      return 'rate_limited';
    }
    if (statusCode === 504) {
      return 'timeout';
    }
    if (statusCode === 502 || statusCode === 503) {
      return 'unavailable';
    }
    return statusCode >= 500 ? 'unavailable' : 'bad_request';
  }
}
