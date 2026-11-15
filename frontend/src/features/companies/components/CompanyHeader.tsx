import { Badge } from '@/components/ui/badge'
import type { Company } from '../types/company.types'

type CompanyHeaderProps = {
  company: Company
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return '?'
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}

export function CompanyHeader({ company }: CompanyHeaderProps) {
  return (
    <div className="flex items-start gap-4 text-left">
      <div
        className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent text-sm font-semibold tracking-wide text-accent-foreground"
        aria-hidden
      >
        {initials(company.name)}
      </div>
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {company.name}
          </h2>
          <Badge>{company.ticker}</Badge>
        </div>
        <dl className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2 sm:gap-x-6">
          <div className="flex gap-2">
            <dt className="font-medium text-foreground/70">CIK</dt>
            <dd className="font-mono text-xs sm:text-sm">{company.cik}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium text-foreground/70">Ticker</dt>
            <dd>{company.ticker}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
