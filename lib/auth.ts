import { SignJWT, jwtVerify } from 'jose'
import { NextRequest } from 'next/server'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your_super_secret_jwt_key_min_32_characters_long_for_security'
)

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin'

export interface SessionData {
  username: string
  isAuthenticated: boolean
  exp: number
}

export class AuthError extends Error {
  constructor(message: string, public status: number = 401) {
    super(message)
    this.name = 'AuthError'
  }
}

export async function createSession(username: string): Promise<string> {
  const payload = {
    username,
    isAuthenticated: true,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
  }

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)
}

export async function verifySession(token: string): Promise<SessionData> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    // Safely extract the known properties from the JWT payload
    if (typeof payload.username === 'string' && 
        typeof payload.isAuthenticated === 'boolean' && 
        typeof payload.exp === 'number') {
      return {
        username: payload.username,
        isAuthenticated: payload.isAuthenticated,
        exp: payload.exp
      }
    }
    
    throw new AuthError('Invalid session data structure', 401)
  } catch (error) {
    if (error instanceof AuthError) throw error
    throw new AuthError('Invalid or expired session', 401)
  }
}

export function validateCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD
}

export async function verifyTurnstile(token: string): Promise<boolean> {
  const secretKey = process.env.CF_TURNSTILE_SECRET_KEY
  
  if (!secretKey) {
    console.error('CF_TURNSTILE_SECRET_KEY is not configured')
    return false
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
      }),
    })

    const data = await response.json()
    return data.success === true
  } catch (error) {
    console.error('Turnstile verification failed:', error)
    return false
  }
}

export function getSessionFromRequest(request: NextRequest): string | null {
  return request.cookies.get('session')?.value || null
}

export function createAuthCookie(token: string) {
  const isProduction = process.env.NODE_ENV === 'production'
  
  return {
    name: 'session',
    value: token,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict' as const,
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/',
  }
}

export function clearAuthCookie() {
  return {
    name: 'session',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 0,
    path: '/',
  }
}

export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const sessionToken = getSessionFromRequest(request)
  
  if (!sessionToken) {
    return false
  }

  try {
    await verifySession(sessionToken)
    return true
  } catch {
    return false
  }
}