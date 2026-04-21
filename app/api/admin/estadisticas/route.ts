import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const RESTAURANTE_ID = process.env.NEXT_PUBLIC_RESTAURANTE_ID ?? 'lynkfood'

export async function GET(req: NextRequest) {
  const period = req.nextUrl.searchParams.get('period') ?? 'hoy'

  // HOY → usa mesa_cuentas del turno actual
  if (period === 'hoy') {
    const { data, error } = await supabaseAdmin
      .from('mesa_cuentas')
      .select('items, total, estado')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const rows = data ?? []
    let totalUSD = 0
    const itemMap: Record<string, { nombre: string; emoji: string; cantidad: number; total: number }> = {}

    for (const row of rows) {
      totalUSD += Number(row.total)
      const items = row.items as { menuItemId: string; nombre: string; emoji: string; cantidad: number; precio: number }[]
      for (const item of items) {
        if (!itemMap[item.menuItemId]) {
          itemMap[item.menuItemId] = { nombre: item.nombre, emoji: item.emoji, cantidad: 0, total: 0 }
        }
        itemMap[item.menuItemId].cantidad += item.cantidad
        itemMap[item.menuItemId].total += item.precio * item.cantidad
      }
    }

    return NextResponse.json({
      type: 'caja',
      totalPedidos: rows.length,
      totalUSD,
      topItems: Object.values(itemMap).sort((a, b) => b.cantidad - a.cantidad).slice(0, 10),
    })
  }

  // SEMANA y MES → resumen por fecha + top items
  const isSemana = period === 'semana'
  const desde = new Date()
  if (isSemana) {
    desde.setDate(desde.getDate() - 6)
  } else {
    desde.setDate(1)
  }
  desde.setHours(0, 0, 0, 0)

  const { data, error } = await supabaseAdmin
    .from('pedidos')
    .select('items, created_at')
    .eq('restaurante_id', RESTAURANTE_ID)
    .gte('created_at', desde.toISOString())

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = data ?? []
  const diaMap: Record<string, { total: number; pedidos: number }> = {}
  const itemMap: Record<string, { nombre: string; emoji: string; cantidad: number; total: number }> = {}

  for (const row of rows) {
    const fecha = new Date(row.created_at as string).toISOString().split('T')[0]
    if (!diaMap[fecha]) diaMap[fecha] = { total: 0, pedidos: 0 }
    diaMap[fecha].pedidos += 1
    const items = row.items as { menuItemId: string; nombre: string; emoji: string; cantidad: number; precio: number }[]
    for (const item of items) {
      diaMap[fecha].total += item.precio * item.cantidad
      if (!itemMap[item.menuItemId]) {
        itemMap[item.menuItemId] = { nombre: item.nombre, emoji: item.emoji, cantidad: 0, total: 0 }
      }
      itemMap[item.menuItemId].cantidad += item.cantidad
      itemMap[item.menuItemId].total += item.precio * item.cantidad
    }
  }

  // Build days array
  const dias: { fecha: string; total: number; pedidos: number }[] = []
  if (isSemana) {
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const fecha = d.toISOString().split('T')[0]
      dias.push({ fecha, ...(diaMap[fecha] ?? { total: 0, pedidos: 0 }) })
    }
  } else {
    const daysInMonth = new Date(desde.getFullYear(), desde.getMonth() + 1, 0).getDate()
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(desde.getFullYear(), desde.getMonth(), i)
      const fecha = d.toISOString().split('T')[0]
      dias.push({ fecha, ...(diaMap[fecha] ?? { total: 0, pedidos: 0 }) })
    }
  }

  const totalUSD = dias.reduce((s, d) => s + d.total, 0)
  const totalPedidos = dias.reduce((s, d) => s + d.pedidos, 0)
  const topItems = Object.values(itemMap).sort((a, b) => b.cantidad - a.cantidad).slice(0, 10)

  return NextResponse.json({ type: isSemana ? 'semana' : 'mes', dias, totalUSD, totalPedidos, topItems })
}
