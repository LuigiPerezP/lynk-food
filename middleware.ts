import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, COOKIE_NAME } from './lib/auth'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get(COOKIE_NAME)?.value

  if (pathname.startsWith('/admin')) {
    const valid = await verifyToken(token, 'admin')
    if (!valid) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('role', 'admin')
      url.searchParams.set('from', pathname)
      return NextResponse.redirect(url)
    }
  }

  if (pathname.startsWith('/cocina')) {
    const isAdmin = await verifyToken(token, 'admin')
    const isCocina = await verifyToken(token, 'cocina')
    if (!isAdmin && !isCocina) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('role', 'cocina')
      url.searchParams.set('from', pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/cocina/:path*'],
}
