'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import type { Order } from '../types'

function mapRow(row: Record<string, unknown>): Order {
  return {
    id: row.id as string,
    mesa: row.mesa as number,
    items: row.items as Order['items'],
    notas: (row.notas as string) ?? '',
    estado: row.estado as Order['estado'],
    creadoEn: new Date(row.created_at as string),
    actualizadoEn: new Date(row.updated_at as string),
  }
}

export function useDailyOrders(restauranteId: string) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    supabase
      .from('pedidos')
      .select('*')
      .eq('restaurante_id', restauranteId)
      .gte('created_at', today.toISOString())
      .then(({ data }) => {
        setOrders((data ?? []).map(mapRow))
        setLoading(false)
      })
  }, [restauranteId])

  return { orders, loading }
}
