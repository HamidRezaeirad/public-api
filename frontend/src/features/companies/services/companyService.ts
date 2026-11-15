import { apiClient } from '@/lib/axios'
import type { Company } from '../types/company.types'

export async function getCompany(ticker: string): Promise<Company> {
  const response = await apiClient.get<Company>(
    `/api/companies/${encodeURIComponent(ticker)}`,
  )
  return response.data
}
