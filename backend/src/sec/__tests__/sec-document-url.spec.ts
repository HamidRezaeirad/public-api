import { describe, expect, it } from '@jest/globals';
import { AppError } from '../../common/errors/app.error';
import { buildPrimaryDocumentUrl } from '../utils/sec-document-url';

const ARCHIVES = 'https://www.sec.gov/Archives/edgar/data';

describe('sec-document-url', () => {
  it('strips CIK leading zeros and accession dashes', () => {
    expect(
      buildPrimaryDocumentUrl(
        ARCHIVES,
        '0000320193',
        '0000320193-24-000123',
        'aapl-20240928.htm',
      ),
    ).toBe(
      'https://www.sec.gov/Archives/edgar/data/320193/000032019324000123/aapl-20240928.htm',
    );
  });

  it('preserves safe nested SEC document paths', () => {
    expect(
      buildPrimaryDocumentUrl(
        ARCHIVES,
        '0000320193',
        '0000320193-24-000123',
        'xslF345X06/form4.xml',
      ),
    ).toBe(
      'https://www.sec.gov/Archives/edgar/data/320193/000032019324000123/xslF345X06/form4.xml',
    );
  });

  it('allows double dots within a filename and encodes URL delimiters', () => {
    expect(
      buildPrimaryDocumentUrl(
        ARCHIVES,
        '0000320193',
        '0000320193-24-000123',
        'exhibit..1?.htm',
      ),
    ).toBe(
      'https://www.sec.gov/Archives/edgar/data/320193/000032019324000123/exhibit..1%3F.htm',
    );
  });

  it.each([
    '../evil.htm',
    'xsl/../evil.htm',
    'xsl/%2e%2e/evil.htm',
    'xsl/%2f..%2fevil.htm',
    'xsl\\evil.htm',
  ])('rejects unsafe primary document path %s', (primaryDocument) => {
    expect(() =>
      buildPrimaryDocumentUrl(
        ARCHIVES,
        '0000320193',
        '0000320193-24-000123',
        primaryDocument,
      ),
    ).toThrow(
      new AppError(
        'bad_response',
        'SEC primary document name contains unsafe path segments.',
      ),
    );
  });
});
