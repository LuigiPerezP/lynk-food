'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../supabase'
import type { Order, OrderStatus } from '../types'

function mapRow(row: Record<string, unknown>): Order {
  return {
    id: row.id as string,
    mesa: row.mesa as number,
    items: row.items as Order['items'],
    notas: (row.notas as string) ?? '',
    estado: row.estado as OrderStatus,
    clientId: (row.client_id as string) ?? null,
    creadoEn: new Date(row.created_at as string),
    actualizadoEn: new Date(row.updated_at as string),
  }
}

export function useSessionOrders(restauranteId: string, mesa: number, clientId: string) {
  const [pedidos, setPedidos] = useState<Order[]>([])
  const [cuentaAbierta, setCuentaAbierta] = useState(false)
  const [cuentaRecienCerrada, setCuentaRecienCerrada] = useState(false)
  const prevAbierta = useRef(false)
  const sinceRef = useRef<string | null>(null)

  const fetchCuenta = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch(`/api/mesa/cuenta?mesa=${mesa}`)
      if (!res.ok) return null
      const data = await res.json() as { id: string; estado: string; creadoEn: string } | null
      const abierta = !!data && data.estado === 'abierta'

      if (prevAbierta.current && !abierta) {
        setCuentaRecienCerrada(true)
      }
      prevAbierta.current = abierta
      setCuentaAbierta(abierta)
      sinceRef.current = data?.creadoEn ?? null
      return data?.creadoEn ?? null
    } catch {
      return null
    }
  }, [mesa])

  const fetchPedidos = useCallback(async (since: string) => {
    const { data } = await supabase
      .from('pedidos')
      .select('*')
      .eq('restaurante_id', restauranteId)
      .eq('mesa', mesa)
      .gte('created_at', since)
      .order('created_at', { ascending: true })
    setPedidos((data ?? []).map(mapRow))
  }, [restauranteId, mesa])

  const reload = useCallback(async () => {
    const since = await fetchCuenta()
    if (since) await fetchPedidos(since)
    else setPedidos([])
  }, [fetchCuenta, fetchPedidos])

  useEffect(() => {
    reload()

    const ts = Date.now()

    const pedidosChannel = supabase
      .channel(`session-pedidos-${restauranteId}-${mesa}-${ts}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pedidos',
        filter: `restaurante_id=eq.${restauranteId}`,
      }, () => {
        if (sinceRef.current) fetchPedidos(sinceRef.current)
      })
      .subscribe()

    // Subscribe to mesa_cuentas for closure detection (works if anon has read access)
    const cuentaChannel = supabase
      .channel(`session-cuenta-${mesa}-${ts}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'mesa_cuentas',
      }, reload)
      .subscribe()

    // Fallback poll every 20s to catch closure if realtime on mesa_cuentas is blocked by RLS
    const interval = setInterval(reload, 20_000)

    return () => {
      supabase.removeChannel(pedidosChannel)
      supabase.removeChannel(cuentaChannel)
      clearInterval(interval)
    }
  }, [restauranteId, mesa]) // eslint-disable-line react-hooks/exhaustive-deps

  const pedidosMios = pedidos.filter(p => p.clientId === clientId)
  const totalMio = pedidosMios.reduce((s, p) => s + p.items.reduce((si, i) => si + i.precio * i.cantidad, 0), 0)
  const totalMesa = pedidos.reduce((s, p) => s + p.items.reduce((si, i) => si + i.precio * i.cantidad, 0), 0)

  return {
    pedidosMios,
    pedidosMesa: pedidos,
    totalMio,
    totalMesa,
    cuentaAbierta,
    cuentaRecienCerrada,
    setCuentaRecienCerrada,
    reload,
  }
}
