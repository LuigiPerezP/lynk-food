'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabase'
import type { Order, OrderStatus } from '../types'

const ACTIVE_STATUSES: OrderStatus[] = ['nuevo', 'preparando', 'listo']

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

export function useOrders(restauranteId: string, estados: OrderStatus[] = ACTIVE_STATUSES) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('pedidos')
      .select('*')
      .eq('restaurante_id', restauranteId)
      .in('estado', estados)
      .order('created_at', { ascending: false })

    if (err) { setError('No se pudo conectar.'); return }
    setOrders((data ?? []).map(mapRow))
    setLoading(false)
    setError(null)
  }, [restauranteId, estados.join(',')])  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchOrders()

    const channel = supabase
      .channel(`pedidos-${restauranteId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, fetchOrders)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchOrders, restauranteId])

  return { orders, loading, error, retry: fetchOrders }
}
