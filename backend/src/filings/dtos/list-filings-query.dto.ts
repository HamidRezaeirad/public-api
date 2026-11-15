import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export class ListFilingsQueryDto {
  @ApiPropertyOptional({ example: '10-K' })
  @IsOptional()
  @IsString()
  formType?: string;

  @ApiPropertyOptional({ example: '2020-01-01' })
  @IsOptional()
  @Matches(ISO_DATE_ONLY, { message: 'startDate must be YYYY-MM-DD' })
  @IsISO8601({ strict: true }, { message: 'startDate must be a valid date' })
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @Matches(ISO_DATE_ONLY, { message: 'endDate must be YYYY-MM-DD' })
  @IsISO8601({ strict: true }, { message: 'endDate must be a valid date' })
  endDate?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
