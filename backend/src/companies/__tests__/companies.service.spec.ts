import { describe, expect, it } from '@jest/globals';
import { AppError } from '../../common/errors/app.error';
import { CompaniesService } from '../companies.service';

describe('CompaniesService', () => {
  const service = new CompaniesService();

  it('lists all supported companies', () => {
    expect(service.findAll()).toEqual([
      { ticker: 'AAPL', name: 'Apple Inc.', cik: '0000320193' },
      { ticker: 'META', name: 'Meta Platforms, Inc.', cik: '0001326801' },
      { ticker: 'GOOGL', name: 'Alphabet Inc.', cik: '0001652044' },
      { ticker: 'AMZN', name: 'Amazon.com, Inc.', cik: '0001018724' },
      { ticker: 'NFLX', name: 'Netflix, Inc.', cik: '0001065280' },
      {
        ticker: 'GS',
        name: 'The Goldman Sachs Group, Inc.',
        cik: '0000886982',
      },
    ]);
  });

  it('returns a supported company by ticker', () => {
    expect(service.findByTicker('aapl')).toEqual({
      ticker: 'AAPL',
      name: 'Apple Inc.',
      cik: '0000320193',
    });
  });

  it('rejects unsupported tickers', () => {
    expect(() => service.findByTicker('MSFT')).toThrow(
      new AppError('not_found', 'Company with ticker "MSFT" is not supported.'),
    );
  });
});
