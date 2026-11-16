import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { loadSecConfig, SecConfig } from './sec.config';
import { SEC_AXIOS, SEC_CONFIG } from './sec.constants';
import { SecClient } from './sec.client';

@Module({
  providers: [
    {
      provide: SEC_CONFIG,
      inject: [ConfigService],
      useFactory: (config: ConfigService): SecConfig => loadSecConfig(config),
    },
    {
      provide: SEC_AXIOS,
      inject: [SEC_CONFIG],
      useFactory: (secConfig: SecConfig): AxiosInstance =>
        axios.create({
          baseURL: secConfig.dataBaseUrl,
          timeout: secConfig.timeoutMs,
          headers: {
            'User-Agent': secConfig.userAgent,
            'Accept-Encoding': 'gzip, deflate',
          },
        }),
    },
    SecClient,
  ],
  exports: [SecClient],
})
export class SecModule {}
