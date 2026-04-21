import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import type { CuentaItem } from '@/lib/cuentas'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('mesa_cuentas')
    .select('*')
    .eq('estado', 'abierta')
    .order('creado_en', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const mapped = (data ?? []).map((c) => ({
    id: c.id,
    mesa: c.mesa,
    estado: c.estado,
    items: c.items,
    total: c.total,
    creadoEn: c.creado_en,
    cerradoEn: c.cerrado_en ?? undefined,
  }))
  return NextResponse.json(mapped)
}

export async function POST(req: NextRequest) {
  const { mesa, items } = await req.json() as { mesa: string; items: CuentaItem[] }

  if (!mesa || !items?.length) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const { data: existing } = await supabaseAdmin
    .from('mesa_cuentas')
    .select('id, items, total')
    .eq('mesa', mesa)
    .eq('estado', 'abierta')
    .single()

  if (existing) {
    const merged = mergeItems(existing.items as CuentaItem[], items)
    const total = merged.reduce((s, i) => s + i.precio * i.cantidad, 0)
    const { error } = await supabaseAdmin
      .from('mesa_cuentas')
      .update({ items: merged, total })
      .eq('id', existing.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ id: existing.id })
  }

  const total = items.reduce((s, i) => s + i.precio * i.cantidad, 0)
  const { data, error } = await supabaseAdmin
    .from('mesa_cuentas')
    .insert({ mesa, items, total, estado: 'abierta' })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id }, { status: 201 })
}

function mergeItems(existing: CuentaItem[], incoming: CuentaItem[]): CuentaItem[] {
  const map = new Map(existing.map((i) => [i.menuItemId, { ...i }]))
  for (const item of incoming) {
    const found = map.get(item.menuItemId)
    if (found) {
      found.cantidad += item.cantidad
    } else {
      map.set(item.menuItemId, { ...item })
    }
  }
  return Array.from(map.values())
}
