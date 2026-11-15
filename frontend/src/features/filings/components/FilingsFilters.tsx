import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  emptyFilingsFilters,
  filingsFiltersSchema,
  type FilingsFiltersFormValues,
} from '../types/filing.types'

type FilingsFiltersProps = {
  values: FilingsFiltersFormValues
  onApply: (values: FilingsFiltersFormValues) => void
  disabled?: boolean
}

export function FilingsFilters({
  values,
  onApply,
  disabled = false,
}: FilingsFiltersProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FilingsFiltersFormValues>({
    resolver: zodResolver(filingsFiltersSchema),
    values,
  })

  return (
    <form
      className="rounded-lg border border-border/80 bg-muted/50 p-4"
      onSubmit={handleSubmit(onApply)}
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5 text-left">
          <Label htmlFor="formType" className="text-xs">
            Form type
          </Label>
          <Input
            id="formType"
            placeholder="e.g. 10-K"
            className="bg-card"
            disabled={disabled || isSubmitting}
            {...register('formType')}
          />
          {errors.formType ? (
            <p className="text-sm text-destructive">{errors.formType.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5 text-left">
          <Label htmlFor="startDate" className="text-xs">
            Start date
          </Label>
          <Input
            id="startDate"
            type="date"
            className="bg-card"
            disabled={disabled || isSubmitting}
            {...register('startDate')}
          />
          {errors.startDate ? (
            <p className="text-sm text-destructive">{errors.startDate.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5 text-left">
          <Label htmlFor="endDate" className="text-xs">
            End date
          </Label>
          <Input
            id="endDate"
            type="date"
            className="bg-card"
            disabled={disabled || isSubmitting}
            {...register('endDate')}
          />
          {errors.endDate ? (
            <p className="text-sm text-destructive">{errors.endDate.message}</p>
          ) : null}
        </div>

        <div className="flex items-end gap-2">
          <Button type="submit" disabled={disabled || isSubmitting}>
            Apply filters
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={disabled || isSubmitting}
            onClick={() => {
              reset(emptyFilingsFilters)
              onApply(emptyFilingsFilters)
            }}
          >
            Reset
          </Button>
        </div>
      </div>
    </form>
  )
}
