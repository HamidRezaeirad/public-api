import { Injectable } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export type HealthDto = {
  version: string;
  datetime: string;
};

@Injectable()
export class AppService {
  private readonly version = this.readPackageVersion();

  getHealth(): HealthDto {
    return {
      version: this.version,
      datetime: new Date().toISOString(),
    };
  }

  private readPackageVersion(): string {
    const packageJsonPath = join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
      version?: string;
    };

    return packageJson.version ?? '0.0.0';
  }
}
