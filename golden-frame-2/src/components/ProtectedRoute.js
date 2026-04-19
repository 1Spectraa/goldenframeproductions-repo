import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children, permission, adminOnly, founderOnly }) {
  const { session, loading, can, isAdmin, isFounder } = useAuth()

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: '#0D0D0D',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#C9A84C', fontFamily: 'sans-serif', fontSize: '0.9rem'
    }}>
      Loading...
    </div>
  )

  if (!session) return <Navigate to="/login" replace />

  if (founderOnly && !isFounder()) return <Navigate to="/dashboard" replace />
  if (adminOnly && !isAdmin()) return <Navigate to="/dashboard" replace />
  if (permission && !can(permission) && !isAdmin()) return <Navigate to="/dashboard" replace />

  return children
}
