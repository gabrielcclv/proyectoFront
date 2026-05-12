// ═════════════════════════════════════════════════════════════════════════════
// MAIN.JSX — Application Entry Point & Global Provider Setup
// ═════════════════════════════════════════════════════════════════════════════
// Este archivo monta la aplicación React en el DOM e inicializa todos los
// Context Providers globales necesarios para la app: React Query, autenticación
// e internacionalización.

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { AuthProvider } from './contexts/AuthContext.jsx'
import { I18nProvider } from './i18n.jsx'
import App from './App.jsx'
import './index.css'

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ REACT QUERY CONFIGURATION                                                   │
// └─────────────────────────────────────────────────────────────────────────────┘
// QueryClient configurado con valores predeterminados sensatos para datos
// geofísicos que se actualizan lentamente:
//   - staleTime: 5 min (APIs de terremoto y clima actualizan cada 5 min)
//   - retry: 2 (reintentos automáticos en caso de fallos de red)
//   - refetchOnWindowFocus: false (evita refetch innecesarios en volver a focus)
// 
// @ai-assisted Claude suggested the retry/staleTime defaults; verified against
//              React Query v5 docs at tanstack.com/query/latest.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,       // Datos validos por 5 min
      retry: 2,                        // 2 reintentos automáticos en fallos
      refetchOnWindowFocus: false,     // Desactivado para menos ruido de red
    },
  },
})

// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ PROVIDER HIERARCHY (de afuera hacia adentro)                                │
// └─────────────────────────────────────────────────────────────────────────────┘
// StrictMode                 → Detecta code smells en desarrollo
//   └─ QueryClientProvider   → Habilita React Query para fetch de datos
//       └─ BrowserRouter     → Routing con basename para deploy en subdirectorio
//           └─ AuthProvider  → Estado global de autenticación JWT
//               └─ I18nProvider → Sistema de traducción multi-idioma
//                   └─ App    → Componente raíz de la aplicación

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <I18nProvider>
            <App />
          </I18nProvider>
        </AuthProvider>
      </BrowserRouter>
      {/* DevTools solo en desarrollo - ver cache y queries en tiempo real */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)