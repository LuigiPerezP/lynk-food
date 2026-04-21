import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, verifyCocinaToken, COOKIE_NAME, COCINA_COOKIE_NAME } from './lib/auth'

const RESTAURANTE_ID = process.env.NEXT_PUBLIC_RESTAURANTE_ID ?? 'lynkfood'

async function getCocinaPin(): Promise<string | null> {
  try {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/restaurantes?id=eq.${RESTAURANTE_ID}&select=cocina_pin`
    const res = await fetch(url, {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
      next: { revalidate: 60 }, // cache 60s para no golpear la DB en cada request
    })
    const data = await res.json() as { cocina_pin: string }[]
    return data[0]?.cocina_pin ?? null
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

  if (pathname.startsWith('/cocina') && !pathname.startsWith('/cocina/login')) {
    // Admin también puede entrar a cocina
    const isAdmin = await verifyToken(token, 'admin')
    if (!isAdmin) {
      const cocinaToken = req.cookies.get(COCINA_COOKIE_NAME)?.value
      const pin = await getCocinaPin()
      const valid = pin ? await verifyCocinaToken(cocinaToken, pin) : false
      if (!valid) {
        const url = req.nextUrl.clone()
        url.pathname = '/cocina/login'
        return NextResponse.redirect(url)
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/cocina/:path*'],
}
