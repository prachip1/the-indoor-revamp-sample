import { NextResponse } from 'next/server'
import { getRedirectMap, normalizePath } from '@/lib/redirects'

export async function proxy(request) {
  const { pathname } = request.nextUrl

  // 1. Auth redirects for admin area
  const token = request.cookies.get('token')?.value

  if (pathname === '/admin' || pathname === '/admin/') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginPage = pathname === '/admin/login'

  if (isAdminRoute && !isLoginPage && !token) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  if (isLoginPage && token) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  // 2. URL Redirect Manager (public site only — skip admin/api)
  if (!isAdminRoute && !pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
    try {
      const map = await getRedirectMap()
      const hit = map[normalizePath(pathname)]
      if (hit) {
        const target = hit.target.startsWith('http')
          ? hit.target
          : new URL(hit.target, request.url).toString()
        return NextResponse.redirect(target, hit.status || 301)
      }
    } catch {
      // Redirect lookup failed (DB issue etc.) — continue silently
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Run on admin (auth) and public pages, skip Next internals and static
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff|woff2|ttf|otf)$).*)',
  ],
}
