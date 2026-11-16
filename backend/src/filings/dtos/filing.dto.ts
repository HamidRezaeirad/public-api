import { ApiProperty } from '@nestjs/swagger';

export class FilingDto {
  @ApiProperty({ example: '10-K' })
  formType!: string;

  @ApiProperty({ example: '2024-11-01' })
  filingDate!: string;

  @ApiProperty({ example: '2024-09-28' })
  reportDate!: string;

  @ApiProperty({ example: '0000320193-24-000123' })
  accessionNumber!: string;

  @ApiProperty({
    example:
      'https://www.sec.gov/Archives/edgar/data/320193/000032019324000123/aapl-20240928.htm',
  })
  primaryDocumentUrl!: string;
}
