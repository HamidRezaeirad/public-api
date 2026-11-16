import { AppError } from '../../common/errors/app.error';

const SAFE_SUBMISSIONS_FILE = /^[A-Za-z0-9._-]+\.json$/;

export function isSafeSubmissionsFileName(fileName: string): boolean {
  return SAFE_SUBMISSIONS_FILE.test(fileName);
}

export function normalizeCik(cik: string): string {
  const digits = cik.replace(/\D/g, '');
  if (!digits) {
    throw new AppError('bad_request', 'CIK must contain digits.');
  }

  if (digits.length > 10) {
    throw new AppError('bad_request', 'CIK must be at most 10 digits.');
  }

  return digits.padStart(10, '0');
}

export function stripLeadingZeros(paddedCik: string): string {
  const stripped = paddedCik.replace(/^0+/, '');
  return stripped.length > 0 ? stripped : '0';
}
