import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, verifyMesoneroToken, COOKIE_NAME, MESONERO_COOKIE_NAME } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

const RESTAURANTE_ID = process.env.NEXT_PUBLIC_RESTAURANTE_ID ?? 'lynkfood'

async function getMesoneroPin(): Promise<string | null> {
  try {
    const { data } = await supabaseAdmin
      .from('restaurantes').select('mesonero_pin').eq('id', RESTAURANTE_ID).single()
    return data?.mesonero_pin ?? null
  } catch { return null }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const token = req.cookies.get(COOKIE_NAME)?.value
  const isAdmin = await verifyToken(token, 'admin')
  const isCocina = await verifyToken(token, 'cocina')

  let isMesonero = false
  if (!isAdmin && !isCocina) {
    const mesoneroToken = req.cookies.get(MESONERO_COOKIE_NAME)?.value
    const pin = await getMesoneroPin()
    isMesonero = pin ? await verifyMesoneroToken(mesoneroToken, pin) : false
  }

  if (!isAdmin && !isCocina && !isMesonero) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { disponible } = await req.json() as { disponible: boolean }
  const { error } = await supabaseAdmin
    .from('menu_items')
    .update({ disponible })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
