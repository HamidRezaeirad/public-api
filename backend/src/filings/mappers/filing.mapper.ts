import type { SecFilingRecord } from '../../sec/dtos/sec-filing.interface';
import type { FilingDto } from '../dtos/filing.dto';

export function toFilingDto(filing: SecFilingRecord): FilingDto {
  return {
    formType: filing.formType,
    filingDate: filing.filingDate,
    reportDate: filing.reportDate,
    accessionNumber: filing.accessionNumber,
    primaryDocumentUrl: filing.primaryDocumentUrl,
  };
}
