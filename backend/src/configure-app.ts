import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('SEC EDGAR filings')
    .setDescription('Read-only filings API for the supported tickers.')
    .setVersion('1.0')
    .build();

  SwaggerModule.setup('docs', app, () =>
    SwaggerModule.createDocument(app, config),
  );
}
