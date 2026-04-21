import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, verifyMesoneroToken, COOKIE_NAME, MESONERO_COOKIE_NAME } from './lib/auth'

const RESTAURANTE_ID = process.env.NEXT_PUBLIC_RESTAURANTE_ID ?? 'lynkfood'

async function getPinFromDB(field: 'mesonero_pin'): Promise<string | null> {
  try {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/restaurantes?id=eq.${RESTAURANTE_ID}&select=${field}`
    const res = await fetch(url, {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
      next: { revalidate: 60 },
    })
    const data = await res.json() as Record<string, string>[]
    return data[0]?.[field] ?? null
  } catch {
    return null
  }
}

export async function proxy(req: NextRequest) {
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

  if (pathname.startsWith('/mesonero') && !pathname.startsWith('/mesonero/login')) {
    const isAdmin = await verifyToken(token, 'admin')
    if (!isAdmin) {
      const mesoneroToken = req.cookies.get(MESONERO_COOKIE_NAME)?.value
      const pin = await getPinFromDB('mesonero_pin')
      const valid = pin ? await verifyMesoneroToken(mesoneroToken, pin) : false
      if (!valid) {
        const url = req.nextUrl.clone()
        url.pathname = '/mesonero/login'
        return NextResponse.redirect(url)
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/cocina/:path*', '/mesonero/:path*'],
}
