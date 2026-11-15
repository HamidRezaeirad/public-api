import { ApiProperty } from '@nestjs/swagger';

export class CompanyDto {
  @ApiProperty({ example: 'AAPL' })
  ticker!: string;

  @ApiProperty({ example: 'Apple Inc.' })
  name!: string;

  @ApiProperty({ example: '0000320193' })
  cik!: string;
}
