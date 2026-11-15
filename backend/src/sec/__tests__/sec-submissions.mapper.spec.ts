import { describe, expect, it } from '@jest/globals';
import { AppError } from '../../common/errors/app.error';
import {
  mapCompany,
  mapFilingArrays,
  mapHistoricalFiles,
} from '../mappers/sec-submissions.mapper';

const ARCHIVES = 'https://www.sec.gov/Archives/edgar/data';

describe('sec-submissions.mapper', () => {
  it('maps company fields and pads CIK', () => {
    expect(
      mapCompany(
        {
          cik: '320193',
          name: 'Apple Inc.',
          tickers: ['AAPL'],
          exchanges: ['Nasdaq'],
        },
        '0000320193',
      ),
    ).toEqual({
      cik: '0000320193',
      name: 'Apple Inc.',
      tickers: ['AAPL'],
      exchanges: ['Nasdaq'],
    });
  });

  it('maps filing arrays and builds document URLs', () => {
    expect(
      mapFilingArrays(
        ARCHIVES,
        {
          accessionNumber: ['0000320193-24-000123'],
          filingDate: ['2024-11-01'],
          reportDate: ['2024-09-28'],
          form: ['10-K'],
          primaryDocument: ['aapl-20240928.htm'],
        },
        '0000320193',
      ),
    ).toEqual([
      {
        formType: '10-K',
        filingDate: '2024-11-01',
        reportDate: '2024-09-28',
        accessionNumber: '0000320193-24-000123',
        primaryDocument: 'aapl-20240928.htm',
        primaryDocumentUrl:
          'https://www.sec.gov/Archives/edgar/data/320193/000032019324000123/aapl-20240928.htm',
      },
    ]);
  });

  it('derives CIK from accession when mapping historical arrays', () => {
    const filings = mapFilingArrays(
      ARCHIVES,
      {
        accessionNumber: ['0000320193-15-000001'],
        filingDate: ['2015-01-15'],
        reportDate: ['2014-12-31'],
        form: ['8-K'],
        primaryDocument: ['d8k.htm'],
      },
      '',
    );

    expect(filings[0]?.primaryDocumentUrl).toBe(
      'https://www.sec.gov/Archives/edgar/data/320193/000032019315000001/d8k.htm',
    );
  });

  it('filters unsafe historical file names', () => {
    expect(
      mapHistoricalFiles([
        { name: 'CIK0000320193-submissions-001.json' },
        { name: '../secrets.json' },
      ]),
    ).toEqual([{ name: 'CIK0000320193-submissions-001.json' }]);
  });

  it('rejects missing company name', () => {
    expect(() => mapCompany({ cik: '0000320193' }, '0000320193')).toThrow(
      new AppError(
        'bad_response',
        'SEC submissions response is missing company name.',
      ),
    );
  });
});
