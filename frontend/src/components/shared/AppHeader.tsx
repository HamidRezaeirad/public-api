import { FileSearch } from 'lucide-react'

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3.5 sm:px-6">
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm"
          aria-hidden
        >
          <FileSearch className="size-5" />
        </div>
        <div className="min-w-0 text-left">
          <h1 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
            Filings explorer
          </h1>
          <p className="truncate text-xs text-muted-foreground">
            SEC EDGAR company filings via Nest API
          </p>
        </div>
      </div>
    </header>
  )
}
