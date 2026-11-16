import { apiClient } from '@/lib/axios'
import type { FilingsQuery, PaginatedFilings } from '../types/filing.types'

export async function getFilings(
  ticker: string,
  query: FilingsQuery,
  signal?: AbortSignal,
): Promise<PaginatedFilings> {
  const response = await apiClient.get<PaginatedFilings>(
    `/api/companies/${encodeURIComponent(ticker)}/filings`,
    {
      signal,
      params: {
        page: query.page,
        limit: query.limit,
        formType: query.formType,
        startDate: query.startDate,
        endDate: query.endDate,
      },
    },
  )
  return response.data
}
