import { AxiosInstance } from 'axios';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { AppError } from '../../common/errors/app.error';
import { SecConfig } from '../sec.config';
import { SecClient } from '../sec.client';

const testSecConfig: SecConfig = {
  userAgent: 'SEC Filings API test@example.com',
  dataBaseUrl: 'https://data.sec.gov',
  archivesBaseUrl: 'https://www.sec.gov/Archives/edgar/data',
  timeoutMs: 10_000,
  minRequestIntervalMs: 100,
  cacheTtlMs: 300_000,
};

describe('SecClient', () => {
  let http: {
    get: jest.MockedFunction<(...args: any[]) => Promise<{ data: any }>>;
  };
  let client: SecClient;

  beforeEach(() => {
    http = {
      get: jest.fn(),
    };
    client = new SecClient(http as unknown as AxiosInstance, testSecConfig);
  });

  it('orchestrates submissions fetch and mapping', async () => {
    http.get.mockResolvedValue({
      data: {
        cik: '320193',
        name: 'Apple Inc.',
        tickers: ['AAPL'],
        exchanges: ['Nasdaq'],
        filings: {
          recent: {
            accessionNumber: ['0000320193-24-000123'],
            filingDate: ['2024-11-01'],
            reportDate: ['2024-09-28'],
            form: ['10-K'],
            primaryDocument: ['aapl-20240928.htm'],
          },
          files: [
            {
              name: 'CIK0000320193-submissions-001.json',
              filingFrom: '2010-01-01',
              filingTo: '2015-12-31',
            },
          ],
        },
      },
    });

    const result = await client.getCompanySubmissions('320193');

    expect(http.get).toHaveBeenCalledWith('/submissions/CIK0000320193.json');
    expect(result.company.cik).toBe('0000320193');
    expect(result.recentFilings).toHaveLength(1);
    expect(result.historicalFiles).toHaveLength(1);
  });

  it('rejects unsafe historical file names before calling SEC', async () => {
    await expect(client.getSubmissionsFile('../secrets.json')).rejects.toEqual(
      new AppError('bad_request', 'Invalid SEC submissions file name.'),
    );
    expect(http.get).not.toHaveBeenCalled();
  });

  it('caches company submissions and skips a second HTTP call', async () => {
    http.get.mockResolvedValue({
      data: {
        cik: '320193',
        name: 'Apple Inc.',
        tickers: ['AAPL'],
        exchanges: ['Nasdaq'],
        filings: {
          recent: {
            accessionNumber: ['0000320193-24-000123'],
            filingDate: ['2024-11-01'],
            reportDate: ['2024-09-28'],
            form: ['10-K'],
            primaryDocument: ['aapl-20240928.htm'],
          },
          files: [],
        },
      },
    });

    await client.getCompanySubmissions('320193');
    await client.getCompanySubmissions('320193');

    expect(http.get).toHaveBeenCalledTimes(1);
  });

  it('surfaces mapped upstream errors from axios failures', async () => {
    http.get.mockRejectedValue({
      isAxiosError: true,
      response: { status: 404 },
    });

    await expect(client.getCompanySubmissions('0000320193')).rejects.toEqual(
      new AppError('not_found', 'SEC resource was not found.'),
    );
  });

  it('delegates document URL building with configured archives base', () => {
    expect(
      client.buildPrimaryDocumentUrl(
        '0000320193',
        '0000320193-24-000123',
        'aapl-20240928.htm',
      ),
    ).toBe(
      'https://www.sec.gov/Archives/edgar/data/320193/000032019324000123/aapl-20240928.htm',
    );
  });
});
