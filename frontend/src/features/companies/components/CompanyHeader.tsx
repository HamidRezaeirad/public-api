import type { Company } from '../types/company.types'

type CompanyHeaderProps = {
  company: Company
}

export function CompanyHeader({ company }: CompanyHeaderProps) {
  return (
    <div className="space-y-1 text-left">
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
        {company.name}
      </h2>
      <p className="text-sm text-muted-foreground">
        {company.ticker} · CIK {company.cik}
      </p>
    </div>
  )
}
