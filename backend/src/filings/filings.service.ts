import { Injectable } from '@nestjs/common';
import { AppError } from '../common/errors/app.error';
import { CompaniesService } from '../companies/companies.service';
import type { SecCompanySubmissions } from '../sec/dtos/sec-company.interface';
import type {
  SecFilingRecord,
  SecSubmissionsFileRef,
} from '../sec/dtos/sec-filing.interface';
import { SecClient } from '../sec/sec.client';
import { FilingDto } from './dtos/filing.dto';
import { ListFilingsQueryDto } from './dtos/list-filings-query.dto';
import { PaginatedFilingsDto } from './dtos/paginated-filings.dto';
import { toFilingDto } from './mappers/filing.mapper';
import {
  filterFilings,
  mergeByAccession,
  oldestFilingDate,
  paginateFilings,
  sortFilings,
} from './utils/filings-collection';
import {
  assertAccessionNumber,
  assertDateRange,
  effectiveHistoricalStart,
  selectHistoricalFilesForAccession,
  selectOverlappingHistoricalFiles,
} from './utils/filings-query';

@Injectable()
export class FilingsService {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly secClient: SecClient,
  ) {}

  async list(
    ticker: string,
    query: ListFilingsQueryDto,
  ): Promise<PaginatedFilingsDto> {
    assertDateRange(query.startDate, query.endDate);

    const company = this.companiesService.findByTicker(ticker);
    const submissions = await this.secClient.getCompanySubmissions(company.cik);
    const filings = await this.collectFilings(submissions, query);
    const page = paginateFilings(
      sortFilings(filterFilings(filings, query)),
      query.page,
      query.limit,
    );

    return {
      data: page.data.map((filing) => toFilingDto(filing)),
      page: query.page,
      limit: query.limit,
      total: page.total,
      totalPages: page.totalPages,
    };
  }

  async findByAccession(
    ticker: string,
    accessionNumber: string,
  ): Promise<FilingDto> {
    const normalizedAccession = assertAccessionNumber(accessionNumber);
    const company = this.companiesService.findByTicker(ticker);
    const submissions = await this.secClient.getCompanySubmissions(company.cik);

    const fromRecent = submissions.recentFilings.find(
      (filing) => filing.accessionNumber === normalizedAccession,
    );
    if (fromRecent) {
      return toFilingDto(fromRecent);
    }

    const historicalFiles = selectHistoricalFilesForAccession(
      submissions.historicalFiles,
      normalizedAccession,
    );

    for (const file of historicalFiles) {
      const historical = await this.secClient.getSubmissionsFile(file.name);
      const match = historical.find(
        (filing) => filing.accessionNumber === normalizedAccession,
      );
      if (match) {
        return toFilingDto(match);
      }
    }

    throw new AppError(
      'not_found',
      `Filing "${normalizedAccession}" was not found for ${company.ticker}.`,
    );
  }

  /**
   * Recent-only when no dates. Load historical when the query can fall
   * outside the recent window (including endDate-only).
   */
  private async collectFilings(
    submissions: SecCompanySubmissions,
    query: ListFilingsQueryDto,
  ): Promise<SecFilingRecord[]> {
    const recent = [...submissions.recentFilings];
    const historicalStart = effectiveHistoricalStart(
      query.startDate,
      query.endDate,
    );
    const oldestRecent = oldestFilingDate(recent);

    if (
      historicalStart === undefined ||
      (oldestRecent !== undefined && historicalStart >= oldestRecent)
    ) {
      return recent;
    }

    const historical = await this.loadHistoricalFilings(
      submissions.historicalFiles,
      historicalStart,
      query.endDate,
    );
    return mergeByAccession(recent, historical);
  }

  private async loadHistoricalFilings(
    files: readonly SecSubmissionsFileRef[],
    startDate: string,
    endDate?: string,
  ): Promise<SecFilingRecord[]> {
    const overlapping = selectOverlappingHistoricalFiles(
      files,
      startDate,
      endDate,
    );

    const batches = await Promise.all(
      overlapping.map((file) => this.secClient.getSubmissionsFile(file.name)),
    );

    return batches.flat();
  }
}
