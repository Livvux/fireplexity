import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from './lib/auth'

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout']
const STATIC_PATHS = ['/_next', '/favicon.ico', '/livvuxplexity-wordmark.svg']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip authentication for static files and public paths
  if (
    STATIC_PATHS.some(path => pathname.startsWith(path)) ||
    PUBLIC_PATHS.includes(pathname)
  ) {
    return NextResponse.next()
  }

  // Check if user is authenticated
  const authenticated = await isAuthenticated(request)

  if (!authenticated) {
    // Store the original URL to redirect back after login
    const loginUrl = new URL('/login', request.url)
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname)
    }
    
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}