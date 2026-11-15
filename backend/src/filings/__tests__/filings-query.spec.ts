import { describe, expect, it } from '@jest/globals';
import { AppError } from '../../common/errors/app.error';
import { assertDateRange } from '../utils/filings-query';

describe('filings-query', () => {
  it('allows valid or open-ended ranges', () => {
    expect(() => assertDateRange('2020-01-01', '2024-01-01')).not.toThrow();
    expect(() => assertDateRange('2020-01-01')).not.toThrow();
    expect(() => assertDateRange(undefined, '2024-01-01')).not.toThrow();
  });

  it('rejects reversed date ranges', () => {
    expect(() => assertDateRange('2024-12-31', '2024-01-01')).toThrow(
      new AppError('bad_request', 'startDate must be on or before endDate.'),
    );
  });
});
