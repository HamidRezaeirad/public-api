import { Button } from '@/components/ui/button'

type FilingsPaginationProps = {
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
  disabled?: boolean
}

export function FilingsPagination({
  page,
  totalPages,
  total,
  onPageChange,
  disabled = false,
}: FilingsPaginationProps) {
  if (totalPages <= 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages} · {total} filing{total === 1 ? '' : 's'}
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={disabled || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
