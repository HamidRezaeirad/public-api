import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppExceptionFilter } from './common/filters/app-exception.filter';

const DEFAULT_CORS_ORIGINS = ['http://localhost:5173'];

export function resolveCorsOrigins(
  raw: string | undefined = process.env.CORS_ORIGINS,
): string[] {
  if (!raw?.trim()) {
    return [...DEFAULT_CORS_ORIGINS];
  }

  const origins = raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins.length > 0 ? origins : [...DEFAULT_CORS_ORIGINS];
}

export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api', {
    exclude: ['health'],
  });
  app.enableCors({
    origin: resolveCorsOrigins(),
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
        exposeDefaultValues: true,
      },
    }),
  );
  app.useGlobalFilters(new AppExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('SEC EDGAR filings')
    .setDescription('Read-only filings API for the supported tickers.')
    .setVersion('1.0')
    .build();

  SwaggerModule.setup('docs', app, () =>
    SwaggerModule.createDocument(app, config),
  );
}
