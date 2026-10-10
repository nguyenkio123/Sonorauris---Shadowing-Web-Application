import { BrowserRouter, useLocation } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { AppRoutes } from './routes/AppRoutes'
import { AuthProvider } from './context/AuthContext'

function AppLayout() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#171B2A] font-sans selection:bg-[#4E9488]/20 selection:text-[#171B2A]">
      {!isAuthPage && <Header />}
      <main className="flex-1">
        <AppRoutes />
      </main>
      {!isAuthPage && <Footer />}
    </div>
  )
}

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
