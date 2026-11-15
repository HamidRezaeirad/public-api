import { describe, expect, it } from '@jest/globals';
import { AppError } from '../../common/errors/app.error';
import {
  isSafeSubmissionsFileName,
  normalizeCik,
  stripLeadingZeros,
} from '../utils/sec-identifiers';

describe('sec-identifiers', () => {
  it('normalizes CIK to 10 digits', () => {
    expect(normalizeCik('320193')).toBe('0000320193');
  });

  it('rejects CIK values with no digits', () => {
    expect(() => normalizeCik('abc')).toThrow(
      new AppError('bad_request', 'CIK must contain digits.'),
    );
  });

  it('strips leading zeros', () => {
    expect(stripLeadingZeros('0000320193')).toBe('320193');
  });

  it('validates safe submissions file names', () => {
    expect(
      isSafeSubmissionsFileName('CIK0000320193-submissions-001.json'),
    ).toBe(true);
    expect(isSafeSubmissionsFileName('../secrets.json')).toBe(false);
  });
});
