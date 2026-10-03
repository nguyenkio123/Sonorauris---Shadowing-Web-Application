import { BrowserRouter } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { DemoCheatBar } from './components/layout/DemoCheatBar'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { AppRoutes } from './routes/AppRoutes'

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="flex min-h-screen flex-col bg-white text-[#171B2A] font-sans selection:bg-[#4E9488]/20 selection:text-[#171B2A]">
          <Header />
          <main className="flex-1">
            <AppRoutes />
          </main>
          <Footer />
          <DemoCheatBar />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
