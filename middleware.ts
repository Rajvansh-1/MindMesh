// Edge Middleware — protect routes and redirect based on auth state
// NextAuth v5: export auth() result as the default export

import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/dashboard', '/room']
const ADMIN_ONLY = ['/admin']

export default auth((req: NextRequest & { auth: ReturnType<typeof auth> extends Promise<infer T> ? T : never }) => {
  const { nextUrl } = req
  const session = req.auth

  const isAuthenticated = !!session?.user
  const isAdmin = (session?.user as { role?: string } | null)?.role === 'ADMIN'

  const isProtected = PROTECTED.some((r) => nextUrl.pathname.startsWith(r))
  const isAdminRoute = ADMIN_ONLY.some((r) => nextUrl.pathname.startsWith(r))

  // Unauthenticated → login
  if ((isProtected || isAdminRoute) && !isAuthenticated) {
    const url = new URL('/login', req.url)
    url.searchParams.set('callbackUrl', nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Non-admin on admin route → dashboard
  if (isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Logged-in user on auth pages → dashboard
  if (isAuthenticated && (nextUrl.pathname === '/login' || nextUrl.pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
}
