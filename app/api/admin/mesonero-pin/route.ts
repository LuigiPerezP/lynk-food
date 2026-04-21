import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

const RESTAURANTE_ID = process.env.NEXT_PUBLIC_RESTAURANTE_ID ?? 'lynkfood'

export async function PATCH(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  const valid = await verifyToken(token, 'admin')
  if (!valid) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { pin } = await req.json() as { pin: string }
  if (!pin || pin.length < 4 || !/^\d+$/.test(pin)) {
    return NextResponse.json({ error: 'PIN debe tener al menos 4 dígitos' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('restaurantes')
    .update({ mesonero_pin: pin })
    .eq('id', RESTAURANTE_ID)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
