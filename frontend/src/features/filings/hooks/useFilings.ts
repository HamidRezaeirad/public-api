import { useCallback, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getFilings } from '../services/filingsService'
import {
  emptyFilingsFilters,
  toFilingsQuery,
  type FilingsFiltersFormValues,
} from '../types/filing.types'

export function useFilings(ticker: string) {
  const [page, setPage] = useState(1)
  const [filters, setFilters] =
    useState<FilingsFiltersFormValues>(emptyFilingsFilters)

  const query = toFilingsQuery(page, filters)

  const filingsQuery = useQuery({
    queryKey: ['filings', ticker, query],
    queryFn: ({ signal }) => getFilings(ticker, query, signal),
    enabled: Boolean(ticker),
  })

  const applyFilters = useCallback((next: FilingsFiltersFormValues) => {
    setFilters(next)
    setPage(1)
  }, [])

  const resetForTicker = useCallback(() => {
    setFilters(emptyFilingsFilters)
    setPage(1)
  }, [])

  return {
    ...filingsQuery,
    page,
    filters,
    setPage,
    applyFilters,
    resetForTicker,
  }
}
