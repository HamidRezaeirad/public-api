import type { SecFilingRecord } from '../../sec/dtos/sec-filing.interface';
import type { ListFilingsQueryDto } from '../dtos/list-filings-query.dto';

export function oldestFilingDate(
  filings: readonly SecFilingRecord[],
): string | undefined {
  if (filings.length === 0) {
    return undefined;
  }

  let oldest = filings[0]?.filingDate;
  if (!oldest) {
    return undefined;
  }

  for (const filing of filings) {
    if (filing.filingDate < oldest) {
      oldest = filing.filingDate;
    }
  }

  return oldest;
}

export function mergeByAccession(
  primary: readonly SecFilingRecord[],
  secondary: readonly SecFilingRecord[],
): SecFilingRecord[] {
  const byAccession = new Map<string, SecFilingRecord>();
  for (const filing of [...primary, ...secondary]) {
    byAccession.set(filing.accessionNumber, filing);
  }
  return [...byAccession.values()];
}

export function filterFilings(
  filings: readonly SecFilingRecord[],
  query: Pick<ListFilingsQueryDto, 'formType' | 'startDate' | 'endDate'>,
): SecFilingRecord[] {
  const formType = query.formType?.trim();

  return filings.filter((filing) => {
    if (formType && filing.formType !== formType) {
      return false;
    }
    if (query.startDate && filing.filingDate < query.startDate) {
      return false;
    }
    if (query.endDate && filing.filingDate > query.endDate) {
      return false;
    }
    return true;
  });
}

export function sortFilings(
  filings: readonly SecFilingRecord[],
): SecFilingRecord[] {
  return [...filings].sort((left, right) => {
    if (left.filingDate !== right.filingDate) {
      return right.filingDate.localeCompare(left.filingDate);
    }
    return right.accessionNumber.localeCompare(left.accessionNumber);
  });
}

export function paginateFilings(
  filings: readonly SecFilingRecord[],
  page: number,
  limit: number,
): {
  data: SecFilingRecord[];
  total: number;
  totalPages: number;
} {
  const total = filings.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  const start = (page - 1) * limit;

  return {
    data: filings.slice(start, start + limit),
    total,
    totalPages,
  };
}
