import type { SecSubmissionsFileRef } from '../../sec/dtos/sec-filing.interface';

export function fileOverlapsRange(
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
