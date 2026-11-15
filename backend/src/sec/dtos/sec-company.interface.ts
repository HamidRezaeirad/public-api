import { SecFilingRecord, SecSubmissionsFileRef } from './sec-filing.interface';

export interface SecCompanyInfo {
  readonly cik: string;
  readonly name: string;
  readonly tickers: readonly string[];
  readonly exchanges: readonly string[];
}

export interface SecCompanySubmissions {
  readonly company: SecCompanyInfo;
  readonly recentFilings: readonly SecFilingRecord[];
  readonly historicalFiles: readonly SecSubmissionsFileRef[];
}
