'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw, Smartphone, CheckCircle, XCircle, AlertCircle, LogOut, Settings } from 'lucide-react'
import Image from 'next/image'

interface WAHASession {
  name: string
  status: 'STOPPED' | 'STARTING' | 'SCAN_QR_CODE' | 'WORKING' | 'FAILED'
}

interface WhatsAppAuthProps {
  onAuthenticated: (sessionName: string) => void
  onLogout?: () => void
  sessionName?: string
}

export function WhatsAppAuth({ onAuthenticated, onLogout, sessionName }: WhatsAppAuthProps) {
  const [currentSessionName, setCurrentSessionName] = useState<string>(sessionName || '')
  const [session, setSession] = useState<WAHASession | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_lastQrUpdate, setLastQrUpdate] = useState<number>(0)

  const checkSessionStatus = useCallback(async () => {
    // Always set loading to false when done, even if no session name exists
    try {
      if (!currentSessionName) {
        // No session name - just show the start session button
        setSession(null)
        setError(null)
        return
      }
      
      const response = await fetch(`/api/whatsapp/session/${currentSessionName}`)
      if (response.ok) {
        const sessionData = await response.json()
        setSession(sessionData)
        
        if (sessionData.status === 'WORKING') {
          onAuthenticated(currentSessionName)
        } else if (sessionData.status === 'SCAN_QR_CODE') {
          // Fetch QR code when needed
          try {
            const qrResponse = await fetch(`/api/whatsapp/qr/${currentSessionName}`)
            if (qrResponse.ok) {
              const qrData = await qrResponse.json()
              if (qrData.base64) {
                setQrCode(qrData.base64)
                setLastQrUpdate(Date.now())
              }
            }
          } catch (err) {
            console.error('Failed to fetch QR code:', err)
          }
        }
        
        // Clear any previous errors when we get a successful response
        setError(null)
      } else if (response.status === 404) {
        // Session doesn't exist - treat as STOPPED (this is normal)
        setSession({ name: currentSessionName, status: 'STOPPED' })
        setError(null)
      } else {
        // Only set error for non-404 HTTP errors
        const errorData = await response.json().catch(() => ({}))
        if (errorData.error && !errorData.error.includes('Failed to get session status')) {
          setError(errorData.error)
        } else {
          setError('Failed to connect to WhatsApp service')
        }
      }
    } catch (err) {
      console.error('Session status check error:', err)
      setError('Failed to connect to WhatsApp service')
    } finally {
      setIsLoading(false)
    }
  }, [currentSessionName, onAuthenticated])

  const fetchQRCode = useCallback(async () => {
    if (!currentSessionName) return
    
    try {
      const response = await fetch(`/api/whatsapp/qr/${currentSessionName}`)
      if (response.ok) {
        const qrData = await response.json()
        if (qrData.base64) {
          setQrCode(qrData.base64)
          setLastQrUpdate(Date.now())
        }
      }
    } catch (error) {
      console.error('Failed to fetch QR code:', error)
    }
  }, [currentSessionName])

  const startSession = async () => {
    setIsStarting(true)
    setError(null)
    
    try {
      const response = await fetch('/api/whatsapp/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionName: currentSessionName || undefined }),
      })
      
      if (response.ok) {
        const sessionData = await response.json()
        // Update the session name with the one returned from the API
        setCurrentSessionName(sessionData.name)
        await checkSessionStatus()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to start session')
      }
    } catch {
      setError('Failed to start WhatsApp session')
    } finally {
      setIsStarting(false)
    }
  }

  const restartSession = async () => {
    if (!currentSessionName) return
    
    setIsStarting(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/whatsapp/session/${currentSessionName}/restart`, {
        method: 'POST',
      })
      
      if (response.ok) {
        await new Promise(resolve => setTimeout(resolve, 2000)) // Wait for restart
        await checkSessionStatus()
      } else {
        setError('Failed to restart session')
      }
    } catch {
      setError('Failed to restart WhatsApp session')
    } finally {
      setIsStarting(false)
    }
  }

  const logoutSession = async () => {
    if (!currentSessionName) return
    
    setIsLoggingOut(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/whatsapp/session/${currentSessionName}/logout`, {
        method: 'POST',
      })
      
      if (response.ok) {
        // Reset to stopped state
        setSession({ name: currentSessionName, status: 'STOPPED' })
        setQrCode(null)
        setShowLogoutConfirm(false)
        // Notify parent component about logout
        onLogout?.()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to logout')
      }
    } catch {
      setError('Failed to logout from WhatsApp')
    } finally {
      setIsLoggingOut(false)
    }
  }

  useEffect(() => {
    checkSessionStatus()
  }, [checkSessionStatus])

  useEffect(() => {
    if (session?.status === 'SCAN_QR_CODE') {
      const interval = setInterval(() => {
        checkSessionStatus()
      }, 3000) // Check status every 3 seconds

      return () => clearInterval(interval)
    }
  }, [session?.status, checkSessionStatus])

  useEffect(() => {
    if (session?.status === 'SCAN_QR_CODE' && qrCode) {
      const qrRefreshInterval = setInterval(() => {
        fetchQRCode()
      }, 30000) // Refresh QR code every 30 seconds

      return () => clearInterval(qrRefreshInterval)
    }
  }, [session?.status, qrCode, fetchQRCode])

  const getStatusIcon = () => {
    if (!session) {
      return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
    
    switch (session.status) {
      case 'WORKING':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'SCAN_QR_CODE':
        return <Smartphone className="w-5 h-5 text-blue-500" />
      case 'STARTING':
        return <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = () => {
    if (!session) {
      return 'Ready to start'
    }
    
    switch (session.status) {
      case 'WORKING':
        return 'Connected and ready'
      case 'FAILED':
        return 'Connection failed'
      case 'SCAN_QR_CODE':
        return 'Scan QR code to login'
      case 'STARTING':
        return 'Starting session...'
      case 'STOPPED':
        return 'Session stopped'
      default:
        return 'Unknown status'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-zinc-600 dark:text-zinc-400">Connecting to WhatsApp...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            {getStatusIcon()}
            <span className="font-medium text-zinc-900 dark:text-white">
              {getStatusText()}
            </span>
          </div>

          {(session?.status === 'STOPPED' || !session) && (
            <Button 
              onClick={startSession}
              disabled={isStarting}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isStarting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                'Start WhatsApp Session'
              )}
            </Button>
          )}

          {session?.status === 'FAILED' && (
            <div className="space-y-2">
              <p className="text-sm text-red-600 dark:text-red-400">
                Session failed. This might be due to authentication issues.
              </p>
              <Button 
                onClick={restartSession}
                disabled={isStarting}
                variant="outline"
                className="w-full"
              >
                {isStarting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Restarting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Restart Session
                  </>
                )}
              </Button>
            </div>
          )}

          {session?.status === 'SCAN_QR_CODE' && (
            <div className="space-y-4">
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                <p className="mb-2">Open WhatsApp on your phone and scan this QR code:</p>
                <ol className="text-xs text-left space-y-1 list-decimal list-inside">
                  <li>Open WhatsApp on your phone</li>
                  <li>Tap Menu (⋮) or Settings</li>
                  <li>Tap &quot;Linked Devices&quot;</li>
                  <li>Tap &quot;Link a Device&quot;</li>
                  <li>Scan this QR code</li>
                </ol>
              </div>
              
              {qrCode ? (
                <div className="bg-white p-4 rounded-lg inline-block">
                  <Image
                    src={`data:image/png;base64,${qrCode}`}
                    alt="WhatsApp QR Code"
                    width={200}
                    height={200}
                    className="mx-auto"
                  />
                </div>
              ) : (
                <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Loading QR code...
                  </p>
                </div>
              )}

              <Button 
                onClick={fetchQRCode}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh QR Code
              </Button>

              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                QR code updates automatically every 30 seconds
              </p>
            </div>
          )}

          {session?.status === 'WORKING' && (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-3 flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Session Management
                </h3>
                <div className="space-y-2">
                  <Button 
                    onClick={() => setShowLogoutConfirm(true)}
                    variant="outline"
                    size="sm"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                    disabled={isLoggingOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout from WhatsApp
                  </Button>
                  <Button 
                    onClick={restartSession}
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={isStarting}
                  >
                    {isStarting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Restarting...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Restart Session
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Logout Confirmation Dialog */}
          {showLogoutConfirm && (
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                  Confirm Logout
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
                  This will disconnect your WhatsApp session and remove this device from your connected devices list. 
                  You&apos;ll need to scan the QR code again to reconnect.
                </p>
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => setShowLogoutConfirm(false)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={isLoggingOut}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={logoutSession}
                    size="sm"
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Logging out...
                      </>
                    ) : (
                      <>
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}