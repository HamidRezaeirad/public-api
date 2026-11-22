import { useState } from 'react'
import { Server } from 'lucide-react'
import { StatusMessage } from '@/components/shared/StatusMessage'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CompanyHeader } from '@/features/companies/components/CompanyHeader'
import { CompanySelect } from '@/features/companies/components/CompanySelect'
import { useCompanies } from '@/features/companies/hooks/useCompanies'
import { useCompany } from '@/features/companies/hooks/useCompany'
import { DEFAULT_TICKER } from '@/features/companies/types/company.types'
import { FilingsFilters } from '@/features/filings/components/FilingsFilters'
import { FilingsPagination } from '@/features/filings/components/FilingsPagination'
import { FilingsTable } from '@/features/filings/components/FilingsTable'
import { useFilings } from '@/features/filings/hooks/useFilings'
import { getErrorMessage } from '@/lib/axios'
import { MainLayout } from '@/layouts/MainLayout'

function resolveTicker(
  selected: string,
  companies: { ticker: string }[],
): string {
  if (
    companies.length === 0 ||
    companies.some((company) => company.ticker === selected)
  ) {
    return selected
  }
  return companies[0]?.ticker ?? selected
}

export function CompanyFilingsPage() {
  const [ticker, setTicker] = useState(DEFAULT_TICKER)
  const companiesQuery = useCompanies()
  const companies = companiesQuery.data ?? []
  const activeTicker = resolveTicker(ticker, companies)
  const companyQuery = useCompany(activeTicker)
  const filings = useFilings(activeTicker)
  const { resetForTicker } = filings

  const handleTickerChange = (next: string) => {
    setTicker(next)
    resetForTicker()
  }

  const filingsTotal = filings.data?.total

  return (
    <MainLayout>
      <div className="space-y-6">
        <section className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card/80 p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full space-y-2 sm:max-w-xs">
            <CompanySelect
              value={activeTicker}
              companies={companies}
              onChange={handleTickerChange}
              disabled={companiesQuery.isLoading || companiesQuery.isError}
            />
            {companiesQuery.isError ? (
              <StatusMessage
                status="error"
                message={getErrorMessage(companiesQuery.error)}
                onRetry={() => void companiesQuery.refetch()}
              />
            ) : null}
          </div>
          <Badge variant="secondary" className="w-fit gap-1.5 self-start sm:self-auto">
            <Server className="size-3" aria-hidden />
            Nest API
          </Badge>
        </section>

        <Card className="shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-base">Company</CardTitle>
            <CardDescription>
              Selected issuer from the supported ticker set.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {companyQuery.isLoading ? (
              <StatusMessage status="loading" />
            ) : null}

            {companyQuery.isError ? (
              <StatusMessage
                status="error"
                message={getErrorMessage(companyQuery.error)}
                onRetry={() => void companyQuery.refetch()}
              />
            ) : null}

            {companyQuery.data && !companyQuery.isError ? (
              <CompanyHeader company={companyQuery.data} />
            ) : null}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="border-b pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">Filings</CardTitle>
              {typeof filingsTotal === 'number' ? (
                <Badge variant="secondary">{filingsTotal} total</Badge>
              ) : null}
            </div>
            <CardDescription>
              Filter by form type and inclusive filing dates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <FilingsFilters
              values={filings.filters}
              onApply={filings.applyFilters}
              disabled={filings.isFetching}
            />

            {filings.isLoading ? <StatusMessage status="loading" /> : null}

            {filings.isError ? (
              <StatusMessage
                status="error"
                message={getErrorMessage(filings.error)}
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
              <FilingsTable filings={filings.data.data} />
            ) : null}
          </CardContent>

          {!filings.isLoading &&
          !filings.isError &&
          filings.data &&
          filings.data.data.length > 0 ? (
            <CardFooter className="border-t">
              <FilingsPagination
                page={filings.data.page}
                totalPages={filings.data.totalPages}
                total={filings.data.total}
                onPageChange={filings.setPage}
                disabled={filings.isFetching}
              />
            </CardFooter>
          ) : null}
        </Card>
      </div>
    </MainLayout>
  )
}
