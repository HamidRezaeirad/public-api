import axios from 'axios';
import { AppError } from '../../common/errors/app.error';

export function mapSecAxiosError(error: unknown): AppError {
  if (!axios.isAxiosError(error)) {
    return new AppError(
      'unavailable',
      'SEC request failed for an unknown reason.',
    );
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return new AppError('timeout', 'SEC request timed out.');
  }

  const status = error.response?.status;

  switch (status) {
    case 404:
      return new AppError('not_found', 'SEC resource was not found.');
    case 403:
      return new AppError(
        'forbidden',
        'SEC rejected the request. Check SEC_USER_AGENT.',
      );
    case 429:
      return new AppError(
        'rate_limited',
        'SEC rate limit exceeded. Retry later.',
      );
    default:
      break;
  }

  if (status !== undefined && status >= 500) {
    return new AppError('unavailable', 'SEC service is unavailable.');
  }

  return new AppError('unavailable', 'SEC request failed.');
}
