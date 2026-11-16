export interface SecFilingRecord {
  readonly formType: string;
  readonly filingDate: string;
  readonly reportDate: string;
  readonly accessionNumber: string;
  readonly primaryDocument: string;
  readonly primaryDocumentUrl: string;
}

export interface SecSubmissionsFileRef {
  readonly name: string;
  readonly filingFrom?: string;
  readonly filingTo?: string;
}
