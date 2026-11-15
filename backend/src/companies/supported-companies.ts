export type SupportedCompany = {
  readonly ticker: string;
  readonly name: string;
  readonly cik: string;
};

export const SUPPORTED_COMPANIES: readonly SupportedCompany[] = [
  { ticker: 'AAPL', name: 'Apple Inc.', cik: '0000320193' },
  { ticker: 'META', name: 'Meta Platforms, Inc.', cik: '0001326801' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', cik: '0001652044' },
  { ticker: 'AMZN', name: 'Amazon.com, Inc.', cik: '0001018724' },
  { ticker: 'NFLX', name: 'Netflix, Inc.', cik: '0001065280' },
  { ticker: 'GS', name: 'The Goldman Sachs Group, Inc.', cik: '0000886982' },
] as const;

const BY_TICKER = new Map(
  SUPPORTED_COMPANIES.map((company) => [company.ticker, company]),
);

export function findSupportedCompany(
  ticker: string,
): SupportedCompany | undefined {
  return BY_TICKER.get(ticker.trim().toUpperCase());
}
