import { describe, expect, it } from '@jest/globals';
import { AppError } from '../../common/errors/app.error';
import { CompaniesService } from '../companies.service';

describe('CompaniesService', () => {
  const service = new CompaniesService();

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
