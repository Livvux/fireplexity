'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Turnstile from 'react-turnstile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { AuroraText } from '@/components/ui/aurora-text'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [turnstileKey, setTurnstileKey] = useState(0) // For resetting Turnstile
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect') || '/'

  const siteKey = process.env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY

  useEffect(() => {
    // Check if already authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/verify')
        if (response.ok) {
          router.replace(redirectUrl)
        }
      } catch (error) {
        // User is not authenticated, stay on login page
      }
    }
    checkAuth()
  }, [router, redirectUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter both username and password')
      return
    }

    if (!turnstileToken) {
      toast.error('Please complete the security verification')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          turnstileToken,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Login successful!')
        router.replace(redirectUrl)
      } else {
        toast.error(data.error || 'Login failed')
        // Reset Turnstile widget on error
        setTurnstileToken('')
        setTurnstileKey(prev => prev + 1)
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('An unexpected error occurred. Please try again.')
      // Reset Turnstile widget on error
      setTurnstileToken('')
      setTurnstileKey(prev => prev + 1)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTurnstileSuccess = (token: string) => {
    setTurnstileToken(token)
  }

  const handleTurnstileError = () => {
    setTurnstileToken('')
    toast.error('Security verification failed. Please try again.')
  }

  const handleTurnstileExpire = () => {
    setTurnstileToken('')
    toast.warning('Security verification expired. Please verify again.')
  }

  if (!siteKey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
          <p className="text-gray-600">Turnstile site key is not configured. Please check your environment variables.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <Link
            href="https://firecrawl.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <Image 
              src="/livvuxplexity-wordmark.svg" 
              alt="livvuxPlexity Logo" 
              width={120} 
              height={24}
              className="h-6 w-auto"
            />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Title */}
          <div className="text-center">
            <AuroraText className="text-3xl font-bold tracking-tight">
              Sign In
            </AuroraText>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Access your livvuxPlexity v2 dashboard
            </p>
            {redirectUrl !== '/' && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                You'll be redirected to {redirectUrl} after login
              </p>
            )}
          </div>

          {/* Login Form */}
          <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-xl rounded-lg border border-gray-200 dark:border-gray-700">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="username" className="sr-only">
                  Username
                </label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="h-12"
                />
              </div>

              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-12"
                />
              </div>

              {/* Turnstile Widget */}
              <div className="flex justify-center">
                <Turnstile
                  key={turnstileKey}
                  sitekey={siteKey}
                  onVerify={handleTurnstileSuccess}
                  onError={handleTurnstileError}
                  onExpire={handleTurnstileExpire}
                  theme="auto"
                  size="normal"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !turnstileToken}
                className="w-full h-12 text-base font-medium"
                variant="default"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </div>

          {/* Footer Info */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Protected by Cloudflare Turnstile
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}