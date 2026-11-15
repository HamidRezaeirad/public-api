import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompaniesModule } from './companies/companies.module';
import { FilingsModule } from './filings/filings.module';
import { SecModule } from './sec/sec.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SecModule,
    CompaniesModule,
    FilingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
