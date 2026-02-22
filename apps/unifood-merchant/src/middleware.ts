import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { APP_ROUTES } from './lib/routes'

const secret = new TextEncoder().encode(process.env.JWT_AT_SECRET || 'at-secret')

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authToken = request.cookies.get('auth_token')?.value

  // Protected routes
  const isProtectedRoute = pathname.startsWith(APP_ROUTES.DASHBOARD) || pathname.startsWith('/admin')
  const isAuthRoute = pathname.startsWith(APP_ROUTES.LOGIN) || pathname.startsWith(APP_ROUTES.SIGNUP)

  if (isProtectedRoute) {
    if (!authToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      // Decode the JWT to check needsPasswordChange
      const { payload } = await jwtVerify(authToken, secret)
      
      const needsPasswordChange = payload.needsPasswordChange as boolean

      const role = payload.role as string
      
      if (role === 'STUDENT') {
        return NextResponse.redirect(new URL(APP_ROUTES.LOGIN, request.url))
      }

      if (needsPasswordChange && !pathname.startsWith(APP_ROUTES.SETUP_PASSWORD)) {
        return NextResponse.redirect(new URL(APP_ROUTES.SETUP_PASSWORD, request.url))
      }
    } catch (err) {
      // Invalid token
      return NextResponse.redirect(new URL(APP_ROUTES.LOGIN, request.url))
    }
  }

  if (isAuthRoute) {
    if (authToken) {
      try {
        const { payload } = await jwtVerify(authToken, secret)
        const needsPasswordChange = payload.needsPasswordChange as boolean

        // If trying to access /login but they are authenticated and need password change
        if (needsPasswordChange && pathname !== APP_ROUTES.SETUP_PASSWORD) {
           return NextResponse.redirect(new URL(APP_ROUTES.SETUP_PASSWORD, request.url))
        }

        // If trying to access auth pages while fully authenticated
        if (!needsPasswordChange && pathname !== APP_ROUTES.SETUP_PASSWORD) {
          return NextResponse.redirect(new URL(APP_ROUTES.DASHBOARD, request.url))
        }
      } catch (err) {
        // Just let them go to the auth route if token is somehow invalid
      }
    }
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
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public files (e.g., logo-navy.svg)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.svg).*)',
  ],
}
