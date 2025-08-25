import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest, verifySession, AuthError } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const sessionToken = getSessionFromRequest(request)

    if (!sessionToken) {
      return NextResponse.json(
        { authenticated: false, error: 'No session token found' },
        { status: 401 }
      )
    }

    const sessionData = await verifySession(sessionToken)

    return NextResponse.json({
      authenticated: true,
      user: {
        username: sessionData.username,
        isAuthenticated: sessionData.isAuthenticated,
      },
    })
  } catch (error) {
    console.error('Session verification error:', error)
    
    if (error instanceof AuthError) {
      return NextResponse.json(
        { authenticated: false, error: error.message },
        { status: error.status }
      )
    }

    return NextResponse.json(
      { authenticated: false, error: 'Session verification failed' },
      { status: 401 }
    )
  }
}