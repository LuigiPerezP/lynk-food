import { NextRequest, NextResponse } from 'next/server'
import { createCocinaToken, COCINA_COOKIE_NAME, COCINA_COOKIE_MAX_AGE } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

const RESTAURANTE_ID = process.env.NEXT_PUBLIC_RESTAURANTE_ID ?? 'lynkfood'

export async function POST(req: NextRequest) {
  const { pin } = await req.json() as { pin: string }

  if (!pin || !/^\d{6}$/.test(pin)) {
    return NextResponse.json({ error: 'PIN debe ser de 6 dígitos' }, { status: 400 })
  }

  const { data } = await supabaseAdmin
    .from('restaurantes')
    .select('cocina_pin')
    .eq('id', RESTAURANTE_ID)
    .single()

  if (!data?.cocina_pin || pin !== data.cocina_pin) {
    return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 })
  }

  const token = await createCocinaToken(pin)
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COCINA_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COCINA_COOKIE_MAX_AGE,
    path: '/',
  })
  return res
}
