
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/lib/store'
import { useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore()
  const { toast } = useToast()

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to access this page',
      })
    }
  }, [isAuthenticated, toast])

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
