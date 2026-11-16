import { useQuery } from '@tanstack/react-query'
import { getCompany } from '../services/companyService'

export function useCompany(ticker: string) {
  return useQuery({
    queryKey: ['company', ticker],
    queryFn: ({ signal }) => getCompany(ticker, signal),
    enabled: Boolean(ticker),
  })
}
