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

type CacheEntry = {
  readonly expiresAt: number;
  readonly value: unknown;
};

@Injectable()
export class SecClient {
  private lastRequestAt = 0;
  private requestQueue: Promise<void> = Promise.resolve();
  private readonly responseCache = new Map<string, CacheEntry>();

  constructor(
    @Inject(SEC_AXIOS) private readonly http: AxiosInstance,
    @Inject(SEC_CONFIG) private readonly config: SecConfig,
  ) {}

  async getCompanySubmissions(cik: string): Promise<SecCompanySubmissions> {
    const paddedCik = normalizeCik(cik);
    const path = `/submissions/CIK${paddedCik}.json`;
    const cached = this.getCached<SecCompanySubmissions>(path);
    if (cached) {
      return cached;
    }

    const data = await this.getJson<SecSubmissionsResponse>(path);

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

    const mapped: SecCompanySubmissions = {
      company,
      recentFilings,
      historicalFiles,
    };
    this.setCached(path, mapped);
    return mapped;
  }

  async getSubmissionsFile(fileName: string): Promise<SecFilingRecord[]> {
    if (!isSafeSubmissionsFileName(fileName)) {
      throw new AppError('bad_request', 'Invalid SEC submissions file name.');
    }

    const path = `/submissions/${fileName}`;
    const cached = this.getCached<SecFilingRecord[]>(path);
    if (cached) {
      return cached;
    }

    const data = await this.getJson<SecHistoricalFilingsResponse>(path);

    const mapped = mapFilingArrays(this.config.archivesBaseUrl, data, '');
    this.setCached(path, mapped);
    return mapped;
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

  private getCached<T>(path: string): T | undefined {
    if (this.config.cacheTtlMs <= 0) {
      return undefined;
    }

    const entry = this.responseCache.get(path);
    if (!entry) {
      return undefined;
    }
    if (Date.now() >= entry.expiresAt) {
      this.responseCache.delete(path);
      return undefined;
    }
    return entry.value as T;
  }

  private setCached(path: string, value: unknown): void {
    if (this.config.cacheTtlMs <= 0) {
      return;
    }

    this.responseCache.set(path, {
      expiresAt: Date.now() + this.config.cacheTtlMs,
      value,
    });
  }
}
