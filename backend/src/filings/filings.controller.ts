import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FilingDto } from './dtos/filing.dto';
import { ListFilingsQueryDto } from './dtos/list-filings-query.dto';
import { PaginatedFilingsDto } from './dtos/paginated-filings.dto';
import { FilingsService } from './filings.service';

@ApiTags('filings')
@Controller('companies/:ticker/filings')
export class FilingsController {
  constructor(private readonly filingsService: FilingsService) {}

  @Get()
  @ApiOperation({
    summary: 'List company filings newest first with optional filters',
  })
  @ApiOkResponse({ type: PaginatedFilingsDto })
  list(
    @Param('ticker') ticker: string,
    @Query() query: ListFilingsQueryDto,
  ): Promise<PaginatedFilingsDto> {
    return this.filingsService.list(ticker, query);
  }

  @Get(':accessionNumber')
  @ApiOperation({ summary: 'Get one filing by accession number' })
  @ApiOkResponse({ type: FilingDto })
  findByAccession(
    @Param('ticker') ticker: string,
    @Param('accessionNumber') accessionNumber: string,
  ): Promise<FilingDto> {
    return this.filingsService.findByAccession(ticker, accessionNumber);
  }
}
