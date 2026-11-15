import { Module } from '@nestjs/common';
import { CompaniesModule } from '../companies/companies.module';
import { SecModule } from '../sec/sec.module';
import { FilingsController } from './filings.controller';
import { FilingsService } from './filings.service';

@Module({
  imports: [CompaniesModule, SecModule],
  controllers: [FilingsController],
  providers: [FilingsService],
})
export class FilingsModule {}
