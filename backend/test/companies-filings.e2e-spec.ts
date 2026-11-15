import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { SecClient } from '../src/sec/sec.client';

describe('Companies and filings (e2e)', () => {
  let app: INestApplication<App>;

  const secClient = {
    getCompanySubmissions: jest
      .fn<
        () => Promise<{
          company: {
            cik: string;
            name: string;
            tickers: string[];
            exchanges: string[];
          };
          recentFilings: {
            formType: string;
            filingDate: string;
            reportDate: string;
            accessionNumber: string;
            primaryDocument: string;
            primaryDocumentUrl: string;
          }[];
          historicalFiles: unknown[];
        }>
      >()
      .mockResolvedValue({
        company: {
          cik: '0000320193',
          name: 'Apple Inc.',
          tickers: ['AAPL'],
          exchanges: ['Nasdaq'],
        },
        recentFilings: [
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
            formType: '8-K',
            filingDate: '2024-10-01',
            reportDate: '2024-10-01',
            accessionNumber: '0000320193-24-000050',
            primaryDocument: 'd8k.htm',
            primaryDocumentUrl:
              'https://www.sec.gov/Archives/edgar/data/320193/000032019324000050/d8k.htm',
          },
        ],
        historicalFiles: [],
      }),
    getSubmissionsFile: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SecClient)
      .useValue(secClient)
      .compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /api/companies/AAPL', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/companies/AAPL')
      .expect(200);

    expect(response.body).toEqual({
      ticker: 'AAPL',
      name: 'Apple Inc.',
      cik: '0000320193',
    });
  });

  it('GET /api/companies/AAPL/filings?formType=10-K', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/companies/AAPL/filings')
      .query({ formType: '10-K', limit: 5 })
      .expect(200);

    expect(response.body).toEqual({
      page: 1,
      limit: 5,
      total: 1,
      totalPages: 1,
      data: [
        {
          formType: '10-K',
          filingDate: '2024-11-01',
          reportDate: '2024-09-28',
          accessionNumber: '0000320193-24-000123',
          primaryDocumentUrl:
            'https://www.sec.gov/Archives/edgar/data/320193/000032019324000123/aapl-20240928.htm',
        },
      ],
    });
  });

  it('GET /api/companies/MSFT returns 404', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/companies/MSFT')
      .expect(404);

    expect(response.body).toMatchObject({
      statusCode: 404,
      code: 'not_found',
    });
  });
});
