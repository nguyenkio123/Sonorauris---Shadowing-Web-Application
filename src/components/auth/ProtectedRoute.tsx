import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#4E9488] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-[#5B6780]">Checking session...</span>
        </div>
      </div>
    )
  }

  // If user is not logged in or in guest mode, require login
  if (!user || user.isGuest) {
    const target = location.pathname + location.search
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(target)}`}
        state={{ from: target }}
        replace
      />
    )
  }

  return <>{children}</>
}
