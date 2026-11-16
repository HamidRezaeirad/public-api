import { createBrowserRouter } from 'react-router-dom'
import { CompanyFilingsPage } from '@/pages/CompanyFilingsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <CompanyFilingsPage />,
  },
])
