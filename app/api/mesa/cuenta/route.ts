import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  const mesa = req.nextUrl.searchParams.get('mesa')
  if (!mesa) return NextResponse.json(null)

  const { data } = await supabaseAdmin
    .from('mesa_cuentas')
    .select('id, estado, creado_en')
    .eq('mesa', mesa)
    .eq('estado', 'abierta')
    .order('creado_en', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data) return NextResponse.json(null)

  return NextResponse.json({
    id: data.id,
    estado: data.estado,
    creadoEn: data.creado_en,
  })
}
