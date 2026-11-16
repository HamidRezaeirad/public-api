import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { CompanyFilingsPage } from '@/pages/CompanyFilingsPage'

vi.mock('@/features/companies/services/companyService', () => ({
  getCompanies: vi.fn(async () => [
    {
      ticker: 'AAPL',
      name: 'Apple Inc.',
      cik: '0000320193',
    },
  ]),
  getCompany: vi.fn(async () => ({
    ticker: 'AAPL',
    name: 'Apple Inc.',
    cik: '0000320193',
  })),
}))

vi.mock('@/features/filings/services/filingsService', () => ({
  getFilings: vi.fn(async () => ({
    data: [],
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })),
}))

describe('CompanyFilingsPage', () => {
  it('renders the filings explorer header', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CompanyFilingsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(screen.getByText('Filings explorer')).toBeInTheDocument()
    expect(await screen.findByText('Apple Inc.')).toBeInTheDocument()
    expect(
      await screen.findByText('No filings for these filters.'),
    ).toBeInTheDocument()
  })
})
