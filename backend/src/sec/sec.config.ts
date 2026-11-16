import { ConfigService } from '@nestjs/config';

const TRUSTED_DATA_BASE_URL = 'https://data.sec.gov';
const TRUSTED_ARCHIVES_PREFIX = 'https://www.sec.gov/Archives/edgar/data';

export interface SecConfig {
  readonly dataBaseUrl: string;
  readonly archivesBaseUrl: string;
  readonly timeoutMs: number;
  readonly minRequestIntervalMs: number;
  readonly userAgent: string;
}

export function loadSecConfig(config: ConfigService): SecConfig {
  const userAgent = requireString(config, 'SEC_USER_AGENT');
  if (/^https?:\/\//i.test(userAgent) || !userAgent.includes('@')) {
    throw new Error(
      'SEC_USER_AGENT must be a descriptive app name plus a contact email, not a bare URL.',
    );
  }

  const dataBaseUrl = normalizeBaseUrl(
    requireString(config, 'SEC_DATA_BASE_URL'),
  );
  if (dataBaseUrl !== TRUSTED_DATA_BASE_URL) {
    throw new Error(
      `SEC_DATA_BASE_URL must be exactly ${TRUSTED_DATA_BASE_URL}.`,
    );
  }

  const archivesBaseUrl = normalizeBaseUrl(
    requireString(config, 'SEC_ARCHIVES_BASE_URL'),
  );
  if (!archivesBaseUrl.startsWith(TRUSTED_ARCHIVES_PREFIX)) {
    throw new Error(
      `SEC_ARCHIVES_BASE_URL must start with ${TRUSTED_ARCHIVES_PREFIX}.`,
    );
  }

  return {
    userAgent,
    dataBaseUrl,
    archivesBaseUrl,
    timeoutMs: requirePositiveNumber(config, 'SEC_TIMEOUT_MS'),
    minRequestIntervalMs: requirePositiveNumber(
      config,
      'SEC_MIN_REQUEST_INTERVAL_MS',
    ),
  };
}

function requireString(config: ConfigService, key: string): string {
  const value = config.get<string>(key)?.trim() ?? '';
  if (!value) {
    throw new Error(`${key} is required.`);
  }
  return value;
}

function requirePositiveNumber(config: ConfigService, key: string): number {
  const raw = requireString(config, key);
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${key} must be a positive number.`);
  }
  return value;
}

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}
