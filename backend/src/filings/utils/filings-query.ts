import { AppError } from '../../common/errors/app.error';

export function assertDateRange(startDate?: string, endDate?: string): void {
  if (startDate && endDate && startDate > endDate) {
    throw new AppError(
      'bad_request',
      'startDate must be on or before endDate.',
    );
  }
}
