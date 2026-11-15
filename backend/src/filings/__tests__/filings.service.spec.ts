import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { AppError } from '../../common/errors/app.error';
import type { SecCompanySubmissions } from '../../sec/dtos/sec-company.interface';
import type { SecFilingRecord } from '../../sec/dtos/sec-filing.interface';
import { FilingsService } from '../filings.service';

describe('FilingsService', () => {
  const company = {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    cik: '0000320193',
  };

  const recentFilings: SecFilingRecord[] = [
    {
      formType: '10-K',
      filingDate: '2024-11-01',
      reportDate: '2024-09-28',
      accessionNumber: '0000320193-24-000123',
      primaryDocument: 'aapl-20240928.htm',
      primaryDocumentUrl:
        'https://www.sec.gov/Archives/edgar/data/320193/000032019324000123/aapl-20240928.htm',
    },
    {
      formType: '10-Q',
      filingDate: '2023-01-15',
      reportDate: '2022-12-31',
      accessionNumber: '0000320193-23-000010',
      primaryDocument: 'aapl-10q.htm',
      primaryDocumentUrl:
        'https://www.sec.gov/Archives/edgar/data/320193/000032019323000010/aapl-10q.htm',
    },
  ];

  const historicalFiling: SecFilingRecord = {
    formType: '10-K',
    filingDate: '2015-10-28',
    reportDate: '2015-09-26',
    accessionNumber: '0000320193-15-000001',
    primaryDocument: 'aapl-2015.htm',
    primaryDocumentUrl:
      'https://www.sec.gov/Archives/edgar/data/320193/000032019315000001/aapl-2015.htm',
  };

  const submissions: SecCompanySubmissions = {
    company: {
      cik: company.cik,
      name: company.name,
      tickers: ['AAPL'],
      exchanges: ['Nasdaq'],
    },
    recentFilings,
    historicalFiles: [
      {
        name: 'CIK0000320193-submissions-001.json',
        filingFrom: '2010-01-01',
        filingTo: '2019-12-31',
      },
    ],
  };

  let companiesService: { findByTicker: jest.Mock };
  let secClient: {
    getCompanySubmissions: jest.Mock;
    getSubmissionsFile: jest.Mock;
  };
  let service: FilingsService;

  beforeEach(() => {
    companiesService = {
      findByTicker: jest.fn().mockReturnValue(company),
    };
    secClient = {
      getCompanySubmissions: jest.fn().mockResolvedValue(submissions),
      getSubmissionsFile: jest.fn().mockResolvedValue([historicalFiling]),
    };
    service = new FilingsService(companiesService, secClient as never);
  });

  it('loads overlapping historical files when startDate is older than recent', async () => {
    const result = await service.list('AAPL', {
      startDate: '2015-01-01',
      formType: '10-K',
      page: 1,
      limit: 20,
    });

    expect(secClient.getSubmissionsFile).toHaveBeenCalledWith(
      'CIK0000320193-submissions-001.json',
    );
    expect(result.data.map((item) => item.accessionNumber)).toEqual([
      '0000320193-24-000123',
      '0000320193-15-000001',
    ]);
  });

  it('rejects reversed date ranges', async () => {
    await expect(
      service.list('AAPL', {
        startDate: '2024-12-31',
        endDate: '2024-01-01',
        page: 1,
        limit: 20,
      }),
    ).rejects.toEqual(
      new AppError('bad_request', 'startDate must be on or before endDate.'),
    );
  });

  it('finds a filing by accession in recent data', async () => {
    await expect(
      service.findByAccession('AAPL', '0000320193-24-000123'),
    ).resolves.toMatchObject({
      formType: '10-K',
      accessionNumber: '0000320193-24-000123',
    });
  });

  it('finds a filing by accession in historical data', async () => {
    await expect(
      service.findByAccession('AAPL', '0000320193-15-000001'),
    ).resolves.toMatchObject({
      accessionNumber: '0000320193-15-000001',
      formType: '10-K',
    });
  });

  it('returns not_found for a missing accession', async () => {
    await expect(
      service.findByAccession('AAPL', '0000320193-99-999999'),
    ).rejects.toEqual(
      new AppError(
        'not_found',
        'Filing "0000320193-99-999999" was not found for AAPL.',
      ),
    );
  });
});
