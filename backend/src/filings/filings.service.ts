import { Injectable } from '@nestjs/common';
import { AppError } from '../common/errors/app.error';
import { CompaniesService } from '../companies/companies.service';
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
} from './utils/filings-filter-sort';
import {
  assertAccessionNumber,
  selectHistoricalFilesForAccession,
} from './utils/accession-number';
import {
  assertDateRange,
  effectiveHistoricalStart,
} from './utils/filings-query';
import { selectOverlappingHistoricalFiles } from './utils/historical-files';

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

    let filings = [...submissions.recentFilings];
    const oldestRecent = oldestFilingDate(filings);
    const historicalStart = effectiveHistoricalStart(
      query.startDate,
      query.endDate,
    );

    if (
      historicalStart !== undefined &&
      (oldestRecent === undefined || historicalStart < oldestRecent)
    ) {
      const historical = await this.loadHistoricalFilings(
        submissions.historicalFiles,
        historicalStart,
        query.endDate,
      );
      filings = mergeByAccession(filings, historical);
    }

    const sorted = sortFilings(filterFilings(filings, query));
    const page = paginateFilings(sorted, query.page, query.limit);

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
