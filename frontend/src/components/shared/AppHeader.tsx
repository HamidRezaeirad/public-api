export function AppHeader() {
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="text-left">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            SEC EDGAR
          </p>
          <h1 className="text-lg font-semibold text-foreground">
            Filings explorer
          </h1>
        </div>
      </div>
    </header>
  )
}
