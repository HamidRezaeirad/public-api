import { AppError } from '../../common/errors/app.error';
import type { SecSubmissionsFileRef } from '../../sec/dtos/sec-filing.interface';

const ACCESSION_NUMBER = /^\d{10}-\d{2}-\d{6}$/;

/** Service-entry validation for list date filters. */
export function assertDateRange(startDate?: string, endDate?: string): void {
  if (startDate && endDate && startDate > endDate) {
    throw new AppError(
      'bad_request',
      'startDate must be on or before endDate.',
    );
  }
}

/**
 * Lower bound used when deciding whether to load historical SEC files.
 * No dates → undefined (recent-only). endDate-only → open lower bound.
 */
export function effectiveHistoricalStart(
  startDate?: string,
  endDate?: string,
): string | undefined {
  if (startDate) {
    return startDate;
  }
  if (endDate) {
    return '0000-01-01';
  }
  return undefined;
}

export function isValidAccessionNumber(value: string): boolean {
  return ACCESSION_NUMBER.test(value);
}

/** Service-entry validation for accession lookup. */
export function assertAccessionNumber(value: string): string {
  const normalized = value.trim();
  if (!isValidAccessionNumber(normalized)) {
    throw new AppError(
      'bad_request',
      'accessionNumber must match ##########-##-######.',
    );
  }
  return normalized;
}

function fileOverlapsRange(
  file: SecSubmissionsFileRef,
  startDate: string,
  endDate?: string,
): boolean {
  const filingFrom = file.filingFrom ?? '0000-01-01';
  const filingTo = file.filingTo ?? '9999-12-31';

  if (endDate && filingFrom > endDate) {
    return false;
  }

  return filingTo >= startDate;
}

export function selectOverlappingHistoricalFiles(
  files: readonly SecSubmissionsFileRef[],
  startDate: string,
  endDate?: string,
): SecSubmissionsFileRef[] {
  return files.filter((file) => fileOverlapsRange(file, startDate, endDate));
}

/**
 * Prefer historical files whose range overlaps the accession calendar year
 * (YY from ##########-YY-###### → 20YY). Falls back to all files when none match.
 */
export function selectHistoricalFilesForAccession(
  files: readonly SecSubmissionsFileRef[],
  accessionNumber: string,
): SecSubmissionsFileRef[] {
  const yearToken = accessionNumber.split('-')[1];
  if (!yearToken || yearToken.length !== 2) {
    return [...files];
  }

  const year = 2000 + Number(yearToken);
  if (!Number.isFinite(year)) {
    return [...files];
  }

  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;

  const overlapping = files.filter((file) => {
    const filingFrom = file.filingFrom ?? '0000-01-01';
    const filingTo = file.filingTo ?? '9999-12-31';
    return filingFrom <= yearEnd && filingTo >= yearStart;
  });

  return overlapping.length > 0 ? overlapping : [...files];
}
