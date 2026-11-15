import { Injectable } from '@nestjs/common';
import { AppError } from '../common/errors/app.error';
import { CompanyDto } from './dtos/company.dto';
import { findSupportedCompany } from './supported-companies';

@Injectable()
export class CompaniesService {
  findByTicker(ticker: string): CompanyDto {
    const company = findSupportedCompany(ticker);
    if (!company) {
      throw new AppError(
        'not_found',
        `Company with ticker "${ticker.trim().toUpperCase()}" is not supported.`,
      );
    }

    return {
      ticker: company.ticker,
      name: company.name,
      cik: company.cik,
    };
  }
}
