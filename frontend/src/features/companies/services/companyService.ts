import { apiClient } from '@/lib/axios'
import type { Company } from '../types/company.types'

export async function getCompanies(signal?: AbortSignal): Promise<Company[]> {
  const response = await apiClient.get<Company[]>('/api/companies', {
    signal,
  })
  return response.data
}

export async function getCompany(
  ticker: string,
  signal?: AbortSignal,
): Promise<Company> {
  const response = await apiClient.get<Company>(
    `/api/companies/${encodeURIComponent(ticker)}`,
    { signal },
  )
  return response.data
}
