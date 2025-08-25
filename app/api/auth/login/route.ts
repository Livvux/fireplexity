import { NextRequest, NextResponse } from 'next/server'
import { validateCredentials, verifyTurnstile, createSession, createAuthCookie, AuthError } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, turnstileToken } = body

    // Validate required fields
    if (!username || !password || !turnstileToken) {
      return NextResponse.json(
        { error: 'Username, password, and Turnstile token are required' },
        { status: 400 }
      )
    }

    // Verify Turnstile challenge
    const turnstileValid = await verifyTurnstile(turnstileToken)
    if (!turnstileValid) {
      return NextResponse.json(
        { error: 'Turnstile verification failed. Please try again.' },
        { status: 400 }
      )
    }

    // Validate credentials
    if (!validateCredentials(username, password)) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Create session
    const sessionToken = await createSession(username)
    const authCookie = createAuthCookie(sessionToken)

    // Create response with session cookie
    const response = NextResponse.json(
      { success: true, message: 'Login successful' },
      { status: 200 }
    )

    response.cookies.set(authCookie.name, authCookie.value, {
      httpOnly: authCookie.httpOnly,
      secure: authCookie.secure,
      sameSite: authCookie.sameSite,
      maxAge: authCookie.maxAge,
      path: authCookie.path,
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred during login' },
      { status: 500 }
    )
  }
}