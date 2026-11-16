export type Company = {
  ticker: string
  name: string
  cik: string
}

export const SUPPORTED_TICKERS = [
  'AAPL',
  'META',
  'GOOGL',
  'AMZN',
  'NFLX',
  'GS',
] as const

export type SupportedTicker = (typeof SUPPORTED_TICKERS)[number]

export const DEFAULT_TICKER: SupportedTicker = 'AAPL'
