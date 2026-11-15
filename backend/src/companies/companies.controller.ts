import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CompanyDto } from './dtos/company.dto';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get(':ticker')
  @ApiOperation({ summary: 'Look up a supported company by ticker' })
  @ApiOkResponse({ type: CompanyDto })
  findByTicker(@Param('ticker') ticker: string): CompanyDto {
    return this.companiesService.findByTicker(ticker);
  }
}
