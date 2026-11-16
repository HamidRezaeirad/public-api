import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  SUPPORTED_TICKERS,
  type SupportedTicker,
} from '../types/company.types'

type CompanySelectProps = {
  value: SupportedTicker
  onChange: (ticker: SupportedTicker) => void
}

export function CompanySelect({ value, onChange }: CompanySelectProps) {
  return (
    <div className="flex w-full flex-col gap-1.5 sm:max-w-xs">
      <Label htmlFor="company-ticker" className="text-xs font-medium">
        Company ticker
      </Label>
      <Select
        value={value}
        onValueChange={(next) => {
          if (next) {
            onChange(next as SupportedTicker)
          }
        }}
      >
        <SelectTrigger id="company-ticker" className="w-full bg-card">
          <SelectValue placeholder="Select ticker" />
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_TICKERS.map((ticker) => (
            <SelectItem key={ticker} value={ticker}>
              {ticker}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
