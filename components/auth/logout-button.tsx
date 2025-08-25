'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from './auth-provider'
import { toast } from 'sonner'

interface LogoutButtonProps {
  className?: string
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary'
}

export function LogoutButton({ className, variant = 'outline' }: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { logout } = useAuth()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Failed to logout. Please try again.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoggingOut}
      variant={variant}
      className={className}
    >
      {isLoggingOut ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
          Logging out...
        </div>
      ) : (
        'Logout'
      )}
    </Button>
  )
}