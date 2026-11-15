import { describe, expect, it } from '@jest/globals';
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
});
