import { describe, expect, it } from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import { loadSecConfig } from '../sec.config';

describe('loadSecConfig', () => {
  function createConfig(
    values: Record<string, string | undefined>,
  ): ConfigService {
    return {
      get: (key: string) => values[key],
    } as ConfigService;
  }

  const validEnv = {
    SEC_USER_AGENT: 'SEC Filings API test@example.com',
    SEC_DATA_BASE_URL: 'https://data.sec.gov/',
    SEC_ARCHIVES_BASE_URL: 'https://www.sec.gov/Archives/edgar/data/',
    SEC_TIMEOUT_MS: '10000',
    SEC_MIN_REQUEST_INTERVAL_MS: '100',
  };

  it('loads and normalizes valid env values', () => {
    expect(loadSecConfig(createConfig(validEnv))).toEqual({
      userAgent: 'SEC Filings API test@example.com',
      dataBaseUrl: 'https://data.sec.gov',
      archivesBaseUrl: 'https://www.sec.gov/Archives/edgar/data',
      timeoutMs: 10_000,
      minRequestIntervalMs: 100,
    });
  });

  it('rejects a missing key', () => {
    const rest = { ...validEnv };
    delete rest.SEC_TIMEOUT_MS;
    expect(() => loadSecConfig(createConfig(rest))).toThrow(
      'SEC_TIMEOUT_MS is required.',
    );
  });

  it('rejects an untrusted data base URL', () => {
    expect(() =>
      loadSecConfig(
        createConfig({
          ...validEnv,
          SEC_DATA_BASE_URL: 'https://example.com',
        }),
      ),
    ).toThrow('SEC_DATA_BASE_URL must be exactly https://data.sec.gov.');
  });

  it('rejects a non-numeric timeout', () => {
    expect(() =>
      loadSecConfig(
        createConfig({
          ...validEnv,
          SEC_TIMEOUT_MS: 'fast',
        }),
      ),
    ).toThrow('SEC_TIMEOUT_MS must be a positive number.');
  });
});
