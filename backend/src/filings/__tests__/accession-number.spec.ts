import { describe, expect, it } from '@jest/globals';
import { AppError } from '../../common/errors/app.error';
import {
  assertAccessionNumber,
  isValidAccessionNumber,
  selectHistoricalFilesForAccession,
} from '../utils/accession-number';

describe('accession-number', () => {
  it('validates accession format', () => {
    expect(isValidAccessionNumber('0000320193-24-000123')).toBe(true);
    expect(isValidAccessionNumber('bad')).toBe(false);
  });

  it('asserts and trims accession numbers', () => {
    expect(assertAccessionNumber(' 0000320193-24-000123 ')).toBe(
      '0000320193-24-000123',
    );
    expect(() => assertAccessionNumber('not-an-accession')).toThrow(
      new AppError(
        'bad_request',
        'accessionNumber must match ##########-##-######.',
      ),
    );
  });

  it('narrows historical files by accession year when possible', () => {
    const files = [
      {
        name: 'old.json',
        filingFrom: '2010-01-01',
        filingTo: '2015-12-31',
      },
      {
        name: 'mid.json',
        filingFrom: '2016-01-01',
        filingTo: '2019-12-31',
      },
    ];

    expect(
      selectHistoricalFilesForAccession(files, '0000320193-18-000001').map(
        (file) => file.name,
      ),
    ).toEqual(['mid.json']);
  });
});
