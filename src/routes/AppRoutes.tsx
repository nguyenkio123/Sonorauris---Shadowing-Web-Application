import { Navigate, Route, Routes } from 'react-router-dom'
import { BattleLobbyPage } from '../pages/BattleLobbyPage'
import { BattleResultPage } from '../pages/BattleResultPage'
import { BattleRoomPage } from '../pages/BattleRoomPage'
import { HomeCatalogPage } from '../pages/HomeCatalogPage'
import { PracticePage } from '../pages/PracticePage'
import { ResultPage } from '../pages/ResultPage'
import { ShopPage } from '../pages/ShopPage'
import { LoginPage } from '../pages/LoginPage'

import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { AdminRoute } from '../components/admin/AdminRoute'
import { AdminDashboardPage } from '../pages/AdminDashboardPage'

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<LoginPage initialMode="signin" />} />
      <Route path="/register" element={<LoginPage initialMode="signup" />} />

      {/* Protected Application Routes (Login Required) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomeCatalogPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shop"
        element={
          <ProtectedRoute>
            <ShopPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/practice/:clipId"
        element={
          <ProtectedRoute>
            <PracticePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/result/:attemptId"
        element={
          <ProtectedRoute>
            <ResultPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/battle/lobby"
        element={
          <ProtectedRoute>
            <BattleLobbyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/battle/room/:roomCode"
        element={
          <ProtectedRoute>
            <BattleRoomPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/battle/result/:roomCode"
        element={
          <ProtectedRoute>
            <BattleResultPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
