import { toFilingDto } from '../mappers/filing.mapper';

describe('filing.mapper', () => {
  it('maps a SEC filing record to the public DTO', () => {
    expect(
      toFilingDto({
        formType: '10-K',
        filingDate: '2024-11-01',
        reportDate: '2024-09-28',
        accessionNumber: '0000320193-24-000123',
        primaryDocument: 'aapl-20240928.htm',
        primaryDocumentUrl:
          'https://www.sec.gov/Archives/edgar/data/320193/000032019324000123/aapl-20240928.htm',
      }),
    ).toEqual({
      formType: '10-K',
      filingDate: '2024-11-01',
      reportDate: '2024-09-28',
      accessionNumber: '0000320193-24-000123',
      primaryDocumentUrl:
        'https://www.sec.gov/Archives/edgar/data/320193/000032019324000123/aapl-20240928.htm',
    });
  });
});
