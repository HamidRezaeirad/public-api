import { z } from 'zod'

export type Filing = {
  formType: string
  filingDate: string
  reportDate: string
  accessionNumber: string
  primaryDocumentUrl: string
}

export type PaginatedFilings = {
  data: Filing[]
  page: number
  limit: number
  total: number
  totalPages: number
}

const optionalIsoDate = z
  .string()
  .trim()
  .refine((value) => value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: 'Use YYYY-MM-DD',
  })

export const filingsFiltersSchema = z
  .object({
    formType: z.string().trim(),
    startDate: optionalIsoDate,
    endDate: optionalIsoDate,
  })
  .superRefine((value, ctx) => {
    if (value.startDate && value.endDate && value.startDate > value.endDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'endDate must be on or after startDate',
      })
    }
  })

export type FilingsFiltersFormValues = z.infer<typeof filingsFiltersSchema>

export type FilingsQuery = {
  page: number
  limit: number
  formType?: string
  startDate?: string
  endDate?: string
}

export const DEFAULT_FILINGS_LIMIT = 20

export const emptyFilingsFilters: FilingsFiltersFormValues = {
  formType: '',
  startDate: '',
  endDate: '',
}

export function toFilingsQuery(
  page: number,
  filters: FilingsFiltersFormValues,
  limit = DEFAULT_FILINGS_LIMIT,
): FilingsQuery {
  return {
    page,
    limit,
    formType: filters.formType || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
  }
}
