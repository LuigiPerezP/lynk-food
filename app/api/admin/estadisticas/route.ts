import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

function startOf(period: string): string {
  const now = new Date()
  if (period === 'mes') {
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  }
  if (period === 'semana') {
    const d = new Date(now)
    d.setDate(d.getDate() - 6)
    d.setHours(0, 0, 0, 0)
    return d.toISOString()
  }
  // hoy
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

const RESTAURANTE_ID = process.env.NEXT_PUBLIC_RESTAURANTE_ID ?? 'lynkfood'

export async function GET(req: NextRequest) {
  const period = req.nextUrl.searchParams.get('period') ?? 'hoy'
  const desde = startOf(period)

  const { data, error } = await supabaseAdmin
    .from('pedidos')
    .select('items, estado, created_at')
    .eq('restaurante_id', RESTAURANTE_ID)
    .gte('created_at', desde)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = data ?? []
  const totalPedidos = rows.length
  let totalUSD = 0
  const itemMap: Record<string, { nombre: string; emoji: string; cantidad: number; total: number }> = {}

  for (const row of rows) {
    const items = row.items as { menuItemId: string; nombre: string; emoji: string; cantidad: number; precio: number }[]
    for (const item of items) {
      totalUSD += item.precio * item.cantidad
      if (!itemMap[item.menuItemId]) {
        itemMap[item.menuItemId] = { nombre: item.nombre, emoji: item.emoji, cantidad: 0, total: 0 }
      }
      itemMap[item.menuItemId].cantidad += item.cantidad
      itemMap[item.menuItemId].total += item.precio * item.cantidad
    }
  }

  const topItems = Object.values(itemMap)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 10)

  return NextResponse.json({ totalPedidos, totalUSD, topItems, desde })
}
