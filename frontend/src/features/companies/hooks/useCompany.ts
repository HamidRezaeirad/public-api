import { useQuery } from '@tanstack/react-query'
import { toApiError } from '@/lib/axios'
import { getCompany } from '../services/companyService'

export function useCompany(ticker: string) {
  return useQuery({
    queryKey: ['company', ticker],
    queryFn: async () => {
      try {
        return await getCompany(ticker)
      } catch (error) {
        throw toApiError(error)
      }
    },
    enabled: Boolean(ticker),
  })
}
