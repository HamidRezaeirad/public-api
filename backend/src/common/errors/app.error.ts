/**
 * Domain/transport error. Throw from services, SecClient, or SEC mappers.
 * Only AppExceptionFilter maps AppError → HTTP JSON.
 */
export type AppErrorCode =
  | 'not_found'
  | 'bad_request'
  | 'forbidden'
  | 'rate_limited'
  | 'timeout'
  | 'unavailable'
  | 'bad_response';

export class AppError extends Error {
  readonly code: AppErrorCode;

  constructor(code: AppErrorCode, message: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
  }
}
