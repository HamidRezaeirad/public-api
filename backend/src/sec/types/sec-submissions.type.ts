export type SecRecentFilingsArrays = {
  accessionNumber: string[];
  filingDate: string[];
  reportDate: string[];
  form: string[];
  primaryDocument: string[];
};

export type SecSubmissionsFileDescriptor = {
  name: string;
  filingFrom?: string;
  filingTo?: string;
};

export type SecSubmissionsResponse = {
  cik?: string | number;
  name?: string;
  tickers?: string[];
  exchanges?: string[];
  filings?: {
    recent?: Partial<SecRecentFilingsArrays>;
    files?: SecSubmissionsFileDescriptor[];
  };
};

export type SecHistoricalFilingsResponse = {
  accessionNumber?: string[];
  filingDate?: string[];
  reportDate?: string[];
  form?: string[];
  primaryDocument?: string[];
};
