import { NextRequest, NextResponse } from 'next/server'
import { createMesoneroToken, MESONERO_COOKIE_NAME, MESONERO_COOKIE_MAX_AGE } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

const RESTAURANTE_ID = process.env.NEXT_PUBLIC_RESTAURANTE_ID ?? 'lynkfood'

export async function POST(req: NextRequest) {
  const { pin } = await req.json() as { pin: string }

  if (!pin || pin.length < 4) {
    return NextResponse.json({ error: 'PIN inválido' }, { status: 400 })
  }

  const { data } = await supabaseAdmin
    .from('restaurantes')
    .select('mesonero_pin')
    .eq('id', RESTAURANTE_ID)
    .single()

  if (!data?.mesonero_pin || pin !== data.mesonero_pin) {
    return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 })
  }

  const token = await createMesoneroToken(pin)
  const res = NextResponse.json({ ok: true })
  res.cookies.set(MESONERO_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MESONERO_COOKIE_MAX_AGE,
    path: '/',
  })
  return res
}
