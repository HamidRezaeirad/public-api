import { AppError } from '../../common/errors/app.error';
import { normalizeCik, stripLeadingZeros } from './sec-identifiers';

export function buildPrimaryDocumentUrl(
  archivesBaseUrl: string,
  cik: string,
  accessionNumber: string,
  primaryDocument: string,
): string {
  const cikForPath = stripLeadingZeros(normalizeCik(cik));
  const accessionPath = accessionNumber.replace(/-/g, '');
  const document = primaryDocument.replace(/^\/+/, '');

  if (!cikForPath || !accessionPath || !document) {
    throw new AppError(
      'bad_request',
      'Cannot build SEC document URL from incomplete identifiers.',
    );
  }

  const documentSegments = document.split('/');
  const hasUnsafeDocumentSegment = documentSegments.some((segment) => {
    if (!segment) {
      return true;
    }

    try {
      const decodedSegment = decodeURIComponent(segment);
      return (
        decodedSegment === '.' ||
        decodedSegment === '..' ||
        decodedSegment.includes('/') ||
        decodedSegment.includes('\\')
      );
    } catch {
      return true;
    }
  });

  if (hasUnsafeDocumentSegment) {
    throw new AppError(
      'bad_response',
      'SEC primary document name contains unsafe path segments.',
    );
  }

  const encodedDocument = documentSegments.map(encodeURIComponent).join('/');
  return `${archivesBaseUrl}/${cikForPath}/${accessionPath}/${encodedDocument}`;
}

/**
 * Historical submission files do not always repeat CIK. Derive the numeric
 * CIK prefix from the accession number (CIK-year-sequence).
 */
export function buildPrimaryDocumentUrlFromAccession(
  archivesBaseUrl: string,
  accessionNumber: string,
  primaryDocument: string,
): string {
  const cikPrefix = accessionNumber.split('-')[0];
  if (!cikPrefix) {
    throw new AppError(
      'bad_response',
      'SEC accession number is missing a CIK prefix.',
    );
  }

  return buildPrimaryDocumentUrl(
    archivesBaseUrl,
    cikPrefix,
    accessionNumber,
    primaryDocument,
  );
}
