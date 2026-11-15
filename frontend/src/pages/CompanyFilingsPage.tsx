import { useState } from 'react'
import { StatusMessage } from '@/components/shared/StatusMessage'
import { CompanyHeader } from '@/features/companies/components/CompanyHeader'
import { CompanySelect } from '@/features/companies/components/CompanySelect'
import { useCompany } from '@/features/companies/hooks/useCompany'
import {
  DEFAULT_TICKER,
  type SupportedTicker,
} from '@/features/companies/types/company.types'
import { FilingsFilters } from '@/features/filings/components/FilingsFilters'
import { FilingsPagination } from '@/features/filings/components/FilingsPagination'
import { FilingsTable } from '@/features/filings/components/FilingsTable'
import { useFilings } from '@/features/filings/hooks/useFilings'
import { ApiError } from '@/lib/axios'
import { MainLayout } from '@/layouts/MainLayout'

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Request failed'
}

export function CompanyFilingsPage() {
  const [ticker, setTicker] = useState<SupportedTicker>(DEFAULT_TICKER)
  const companyQuery = useCompany(ticker)
  const filings = useFilings(ticker)

  const handleTickerChange = (next: SupportedTicker) => {
    setTicker(next)
    filings.resetForTicker()
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <section className="space-y-4">
          <CompanySelect value={ticker} onChange={handleTickerChange} />

          {companyQuery.isLoading ? (
            <StatusMessage status="loading" />
          ) : null}

          {companyQuery.isError ? (
            <StatusMessage
              status="error"
              message={errorMessage(companyQuery.error)}
              onRetry={() => void companyQuery.refetch()}
            />
          ) : null}

          {companyQuery.data ? (
            <CompanyHeader company={companyQuery.data} />
          ) : null}
        </section>

        <section className="space-y-4">
          <div className="space-y-1 text-left">
            <h3 className="text-lg font-semibold">Filings</h3>
            <p className="text-sm text-muted-foreground">
              Filter by form type and inclusive filing dates.
            </p>
          </div>

          <FilingsFilters
            values={filings.filters}
            onApply={filings.applyFilters}
            disabled={filings.isFetching}
          />

          {filings.isLoading ? <StatusMessage status="loading" /> : null}

          {filings.isError ? (
            <StatusMessage
              status="error"
              message={errorMessage(filings.error)}
              onRetry={() => void filings.refetch()}
            />
          ) : null}

          {!filings.isLoading &&
          !filings.isError &&
          filings.data &&
          filings.data.data.length === 0 ? (
            <StatusMessage
              status="empty"
              message="No filings for these filters."
            />
          ) : null}

          {!filings.isLoading &&
          !filings.isError &&
          filings.data &&
          filings.data.data.length > 0 ? (
            <div className="space-y-4">
              <FilingsTable filings={filings.data.data} />
              <FilingsPagination
                page={filings.data.page}
                totalPages={filings.data.totalPages}
                total={filings.data.total}
                onPageChange={filings.setPage}
                disabled={filings.isFetching}
              />
            </div>
          ) : null}
        </section>
      </div>
    </MainLayout>
  )
}
