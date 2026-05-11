import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { AuthProvider } from './contexts/AuthContext.jsx'
import { I18nProvider } from './i18n.js'
import App from './App.jsx'
import './index.css'

/**
 * QueryClient configured with sensible defaults for geophysical data:
 * - staleTime: 5 min (APIs update infrequently)
 * - retry: 2 (network hiccups happen)
 * @ai-assisted Claude suggested the retry/staleTime defaults; verified against
 *              React Query v5 docs at tanstack.com/query/latest.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/geophysical-aggregator">
        <AuthProvider>
          <I18nProvider>
            <App />
          </I18nProvider>
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)