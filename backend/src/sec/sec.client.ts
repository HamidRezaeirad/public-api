import { Inject, Injectable } from '@nestjs/common';
import type { AxiosInstance } from 'axios';
import { AppError } from '../common/errors/app.error';
import type { SecCompanySubmissions } from './dtos/sec-company.interface';
import type { SecFilingRecord } from './dtos/sec-filing.interface';
import { mapSecAxiosError } from './errors/map-sec-axios-error';
import {
  mapCompany,
  mapFilingArrays,
  mapHistoricalFiles,
} from './mappers/sec-submissions.mapper';
import type { SecConfig } from './sec.config';
import { SEC_AXIOS, SEC_CONFIG } from './sec.constants';
import type {
  SecHistoricalFilingsResponse,
  SecSubmissionsResponse,
} from './types/sec-submissions.type';
import { buildPrimaryDocumentUrl as buildSecPrimaryDocumentUrl } from './utils/sec-document-url';
import {
  isSafeSubmissionsFileName,
  normalizeCik,
} from './utils/sec-identifiers';

@Injectable()
export class SecClient {
  private lastRequestAt = 0;
  private requestQueue: Promise<void> = Promise.resolve();

  constructor(
    @Inject(SEC_AXIOS) private readonly http: AxiosInstance,
    @Inject(SEC_CONFIG) private readonly config: SecConfig,
  ) {}

  async getCompanySubmissions(cik: string): Promise<SecCompanySubmissions> {
    const paddedCik = normalizeCik(cik);
    const data = await this.getJson<SecSubmissionsResponse>(
      `/submissions/CIK${paddedCik}.json`,
    );

    const company = mapCompany(data, paddedCik);
    const recent = data.filings?.recent;
    if (!recent) {
      throw new AppError(
        'bad_response',
        'SEC submissions response is missing recent filings.',
      );
    }

    const recentFilings = mapFilingArrays(
      this.config.archivesBaseUrl,
      recent,
      company.cik,
    );
    const historicalFiles = mapHistoricalFiles(data.filings?.files ?? []);

    return {
      company,
      recentFilings,
      historicalFiles,
    };
  }

  async getSubmissionsFile(fileName: string): Promise<SecFilingRecord[]> {
    if (!isSafeSubmissionsFileName(fileName)) {
      throw new AppError('bad_request', 'Invalid SEC submissions file name.');
    }

    const data = await this.getJson<SecHistoricalFilingsResponse>(
      `/submissions/${fileName}`,
    );

    return mapFilingArrays(this.config.archivesBaseUrl, data, '');
  }

  buildPrimaryDocumentUrl(
    cik: string,
    accessionNumber: string,
    primaryDocument: string,
  ): string {
    return buildSecPrimaryDocumentUrl(
      this.config.archivesBaseUrl,
      cik,
      accessionNumber,
      primaryDocument,
    );
  }

  private async getJson<T>(path: string): Promise<T> {
    await this.scheduleRequest();

    try {
      const response = await this.http.get<T>(path);
      return response.data;
    } catch (error) {
      throw mapSecAxiosError(error);
    }
  }

  private scheduleRequest(): Promise<void> {
    const run = this.requestQueue.then(async () => {
      const waitMs = Math.max(
        0,
        this.config.minRequestIntervalMs - (Date.now() - this.lastRequestAt),
      );
      if (waitMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }
      this.lastRequestAt = Date.now();
    });

    this.requestQueue = run.catch(() => undefined);
    return run;
  }
}
