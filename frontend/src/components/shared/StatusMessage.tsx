import { AlertCircle, Inbox, LoaderCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

type StatusMessageProps = {
  status: 'loading' | 'error' | 'empty'
  message?: string
  onRetry?: () => void
}

export function StatusMessage({ status, message, onRetry }: StatusMessageProps) {
  if (status === 'loading') {
    return (
      <div className="space-y-2.5" role="status" aria-live="polite">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" aria-hidden />
          Loading…
        </div>
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-2/3" />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription className="flex flex-col items-start gap-2.5">
          <span>{message ?? 'Request failed'}</span>
          {onRetry ? (
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          ) : null}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div
      role="status"
      className="relative grid w-full grid-cols-[calc(var(--spacing)*4)_1fr] items-start gap-x-3 gap-y-0.5 rounded-lg border border-dashed bg-muted/40 px-4 py-3 text-sm"
    >
      <Inbox className="size-4 translate-y-0.5 text-current" aria-hidden />
      <div className="col-start-2 font-medium tracking-tight">No results</div>
      <div className="col-start-2 text-sm text-muted-foreground">
        {message ?? 'Nothing to show for the current selection.'}
      </div>
    </div>
  )
}
