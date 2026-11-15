import { AppError } from '../../common/errors/app.error';
import type { SecCompanyInfo } from '../dtos/sec-company.interface';
import type {
  SecFilingRecord,
  SecSubmissionsFileRef,
} from '../dtos/sec-filing.interface';
import type {
  SecHistoricalFilingsResponse,
  SecRecentFilingsArrays,
  SecSubmissionsResponse,
} from '../types/sec-submissions.type';
import {
  buildPrimaryDocumentUrl,
  buildPrimaryDocumentUrlFromAccession,
} from '../utils/sec-document-url';
import {
  isSafeSubmissionsFileName,
  normalizeCik,
} from '../utils/sec-identifiers';

export function mapCompany(
  data: SecSubmissionsResponse,
  fallbackCik: string,
): SecCompanyInfo {
  const cik =
    data.cik !== undefined && data.cik !== null
      ? normalizeCik(String(data.cik))
      : fallbackCik;

  if (!data.name) {
    throw new AppError(
      'bad_response',
      'SEC submissions response is missing company name.',
    );
  }

  return {
    cik,
    name: data.name,
    tickers: data.tickers ?? [],
    exchanges: data.exchanges ?? [],
  };
}

export function mapHistoricalFiles(
  files: { name: string; filingFrom?: string; filingTo?: string }[],
): SecSubmissionsFileRef[] {
  return files
    .filter((file) => isSafeSubmissionsFileName(file.name))
    .map((file) => ({
      name: file.name,
      filingFrom: file.filingFrom,
      filingTo: file.filingTo,
    }));
}

export function mapFilingArrays(
  archivesBaseUrl: string,
  arrays: Partial<SecRecentFilingsArrays> | SecHistoricalFilingsResponse,
  cik: string,
): SecFilingRecord[] {
  const accessionNumbers = arrays.accessionNumber ?? [];
  const filingDates = arrays.filingDate ?? [];
  const reportDates = arrays.reportDate ?? [];
  const forms = arrays.form ?? [];
  const primaryDocuments = arrays.primaryDocument ?? [];
  const length = accessionNumbers.length;

  if (
    filingDates.length !== length ||
    forms.length !== length ||
    primaryDocuments.length !== length
  ) {
    throw new AppError(
      'bad_response',
      'SEC filing arrays have inconsistent lengths.',
    );
  }

  const records: SecFilingRecord[] = [];

  for (let index = 0; index < length; index += 1) {
    const accessionNumber = accessionNumbers[index];
    const filingDate = filingDates[index];
    const formType = forms[index];
    const primaryDocument = primaryDocuments[index];
    const reportDate = reportDates[index] ?? '';

    if (!accessionNumber || !filingDate || !formType || !primaryDocument) {
      throw new AppError(
        'bad_response',
        'SEC filing entry is missing required fields.',
      );
    }

    const primaryDocumentUrl = cik
      ? buildPrimaryDocumentUrl(
          archivesBaseUrl,
          cik,
          accessionNumber,
          primaryDocument,
        )
      : buildPrimaryDocumentUrlFromAccession(
          archivesBaseUrl,
          accessionNumber,
          primaryDocument,
        );

    records.push({
      formType,
      filingDate,
      reportDate,
      accessionNumber,
      primaryDocument,
      primaryDocumentUrl,
    });
  }

  return records;
}
