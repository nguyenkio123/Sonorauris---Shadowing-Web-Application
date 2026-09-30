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
        <div className="flex min-h-screen flex-col bg-white text-[#222222] font-sans selection:bg-[#ff385c]/15 selection:text-[#ff385c]">
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
