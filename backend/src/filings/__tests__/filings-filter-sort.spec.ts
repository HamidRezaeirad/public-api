import { describe, expect, it } from '@jest/globals';
import type { SecFilingRecord } from '../../sec/dtos/sec-filing.interface';
import {
  filterFilings,
  mergeByAccession,
  oldestFilingDate,
  paginateFilings,
  sortFilings,
} from '../utils/filings-filter-sort';

const filings: SecFilingRecord[] = [
  {
    formType: '10-K',
    filingDate: '2024-11-01',
    reportDate: '2024-09-28',
    accessionNumber: '0000320193-24-000123',
    primaryDocument: 'aapl-20240928.htm',
    primaryDocumentUrl: 'https://example.com/10k',
  },
  {
    formType: '8-K',
    filingDate: '2024-11-01',
    reportDate: '2024-11-01',
    accessionNumber: '0000320193-24-000200',
    primaryDocument: 'd8k.htm',
    primaryDocumentUrl: 'https://example.com/8k',
  },
  {
    formType: '10-Q',
    filingDate: '2023-01-15',
    reportDate: '2022-12-31',
    accessionNumber: '0000320193-23-000010',
    primaryDocument: 'aapl-10q.htm',
    primaryDocumentUrl: 'https://example.com/10q',
  },
];

describe('filings-filter-sort', () => {
  it('filters inclusively by filing date and form type', () => {
    const filtered = filterFilings(filings, {
      formType: '10-K',
      startDate: '2024-11-01',
      endDate: '2024-11-01',
    });

    expect(filtered.map((item) => item.accessionNumber)).toEqual([
      '0000320193-24-000123',
    ]);
  });

  it('matches formType case-insensitively', () => {
    const filtered = filterFilings(filings, {
      formType: '10-k',
    });

    expect(filtered.map((item) => item.accessionNumber)).toEqual([
      '0000320193-24-000123',
    ]);
  });

  it('sorts by filing date desc then accession desc', () => {
    expect(sortFilings(filings).map((item) => item.accessionNumber)).toEqual([
      '0000320193-24-000200',
      '0000320193-24-000123',
      '0000320193-23-000010',
    ]);
  });

  it('paginates results', () => {
    const sorted = sortFilings(filings);
    expect(paginateFilings(sorted, 2, 1)).toEqual({
      data: [sorted[1]],
      total: 3,
      totalPages: 3,
    });
  });

  it('returns empty pagination when nothing matches', () => {
    expect(paginateFilings([], 1, 20)).toEqual({
      data: [],
      total: 0,
      totalPages: 0,
    });
  });

  it('merges filings by accession number preferring primary (recent)', () => {
    const merged = mergeByAccession(filings, [
      {
        ...filings[0],
        primaryDocumentUrl: 'https://example.com/historical',
      },
    ]);

    expect(merged).toHaveLength(3);
    expect(
      merged.find((item) => item.accessionNumber === '0000320193-24-000123')
        ?.primaryDocumentUrl,
    ).toBe('https://example.com/10k');
  });

  it('finds the oldest filing date', () => {
    expect(oldestFilingDate(filings)).toBe('2023-01-15');
  });
});
