import { AppError } from '../../common/errors/app.error';

export function assertDateRange(startDate?: string, endDate?: string): void {
  if (startDate && endDate && startDate > endDate) {
    throw new AppError(
      'bad_request',
      'startDate must be on or before endDate.',
    );
  }
}

/**
 * Lower bound used when deciding whether to load historical SEC files.
 * No dates → undefined (recent-only). endDate-only → open lower bound.
 */
export function effectiveHistoricalStart(
  startDate?: string,
  endDate?: string,
): string | undefined {
  if (startDate) {
    return startDate;
  }
  if (endDate) {
    return '0000-01-01';
  }
  return undefined;
}
