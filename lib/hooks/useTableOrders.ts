'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../supabase'
import type { Order, OrderStatus } from '../types'

const ACTIVE: OrderStatus[] = ['nuevo', 'preparando', 'listo']

function mapRow(row: Record<string, unknown>): Order {
  return {
    id: row.id as string,
    mesa: row.mesa as number,
    items: row.items as Order['items'],
    notas: (row.notas as string) ?? '',
    estado: row.estado as OrderStatus,
    creadoEn: new Date(row.created_at as string),
    actualizadoEn: new Date(row.updated_at as string),
  }
}

export function useTableOrders(restauranteId: string, mesa: number) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const fetch = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('pedidos')
        .select('*')
        .eq('restaurante_id', restauranteId)
        .eq('mesa', mesa)
        .in('estado', ACTIVE)
        .order('created_at', { ascending: true })
      setOrders((data ?? []).map(mapRow))
    } catch {}
    setLoading(false)
  }, [restauranteId, mesa])

  useEffect(() => {
    fetch()

    // Unique channel name to avoid conflicts
    const channelName = `table-orders-${restauranteId}-${mesa}-${Date.now()}`
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, fetch)
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [restauranteId, mesa]) // eslint-disable-line react-hooks/exhaustive-deps

  return { orders, loading }
}
