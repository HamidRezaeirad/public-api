import { describe, expect, it } from '@jest/globals';
import { AppError } from '../../common/errors/app.error';
import {
  assertDateRange,
  effectiveHistoricalStart,
} from '../utils/filings-query';

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

  it('derives historical start from startDate, endDate-only, or neither', () => {
    expect(effectiveHistoricalStart('2015-01-01', '2018-12-31')).toBe(
      '2015-01-01',
    );
    expect(effectiveHistoricalStart(undefined, '2018-12-31')).toBe(
      '0000-01-01',
    );
    expect(effectiveHistoricalStart()).toBeUndefined();
  });
});
