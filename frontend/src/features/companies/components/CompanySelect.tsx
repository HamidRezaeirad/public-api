import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { Company } from '../types/company.types'

type CompanySelectProps = {
  value: string
  companies: Company[]
  onChange: (ticker: string) => void
  disabled?: boolean
}

export function CompanySelect({
  value,
  companies,
  onChange,
  disabled = false,
}: CompanySelectProps) {
  return (
    <div className="flex w-full flex-col gap-1.5 sm:max-w-xs">
      <Label htmlFor="company-ticker" className="text-xs font-medium">
        Company ticker
      </Label>
      <Select
        value={value}
        disabled={disabled || companies.length === 0}
        onValueChange={(next) => {
          if (next) {
            onChange(next)
          }
        }}
      >
        <SelectTrigger id="company-ticker" className="w-full bg-card">
          <SelectValue placeholder="Select ticker" />
        </SelectTrigger>
        <SelectContent>
          {companies.map((company) => (
            <SelectItem key={company.ticker} value={company.ticker}>
              {company.ticker}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
