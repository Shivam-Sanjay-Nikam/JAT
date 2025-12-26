
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthProvider'
import { NotificationProvider } from './context/NotificationProvider'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { Friends } from './pages/Friends'
import { Help } from './pages/Help'
import { Todo } from './pages/Todo'
import { Resources } from './pages/Resources'
import { DSASheet } from './pages/DSASheet'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth()

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  if (!session) return <Navigate to="/login" />
  return <>{children}</>
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/todo" element={
              <ProtectedRoute>
                <Todo />
              </ProtectedRoute>
            } />

            <Route path="/friends" element={
              <ProtectedRoute>
                <Friends />
              </ProtectedRoute>
            } />

            <Route path="/resources" element={
              <ProtectedRoute>
                <Resources />
              </ProtectedRoute>
            } />

            <Route path="/dsa-sheet" element={
              <ProtectedRoute>
                <DSASheet />
              </ProtectedRoute>
            } />

            <Route path="/help" element={
              <ProtectedRoute>
                <Help />
              </ProtectedRoute>
            } />

            {/* Catch all redirect */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
