import { describe, expect, it } from '@jest/globals';
import { AppError } from '../../common/errors/app.error';
import {
  assertAccessionNumber,
  assertDateRange,
  effectiveHistoricalStart,
  isValidAccessionNumber,
  selectHistoricalFilesForAccession,
  selectOverlappingHistoricalFiles,
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

  it('selects overlapping historical files by date range', () => {
    const files = [
      {
        name: 'older.json',
        filingFrom: '2010-01-01',
        filingTo: '2015-12-31',
      },
      {
        name: 'newer.json',
        filingFrom: '2016-01-01',
        filingTo: '2019-12-31',
      },
    ];

    expect(
      selectOverlappingHistoricalFiles(files, '2015-01-01', '2015-12-31').map(
        (file) => file.name,
      ),
    ).toEqual(['older.json']);
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
