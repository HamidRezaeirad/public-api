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
      <div className="space-y-3" role="status" aria-live="polite">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" aria-hidden />
          Loading…
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-2/3" />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription className="flex flex-col gap-3">
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
    <Alert>
      <Inbox />
      <AlertTitle>No results</AlertTitle>
      <AlertDescription>
        {message ?? 'Nothing to show for the current selection.'}
      </AlertDescription>
    </Alert>
  )
}
