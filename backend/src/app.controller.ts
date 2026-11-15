import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import type { HealthDto } from './app.service';

@ApiTags('health')
@Controller('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check with app version and current time' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        version: { type: 'string', example: '0.0.1' },
        datetime: {
          type: 'string',
          example: '2026-11-15T21:40:00.000Z',
        },
      },
    },
  })
  getHealth(): HealthDto {
    return this.appService.getHealth();
  }
}
