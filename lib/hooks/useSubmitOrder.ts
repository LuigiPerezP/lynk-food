'use client'

import { useState } from 'react'
import { supabase } from '../supabase'
import type { OrderItem } from '../types'

interface SubmitParams {
  restauranteId: string
  mesa: number
  items: OrderItem[]
  notas: string
}

export function useSubmitOrder() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(params: SubmitParams): Promise<string | null> {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('pedidos')
        .insert({
          restaurante_id: params.restauranteId,
          mesa: params.mesa,
          items: params.items,
          notas: params.notas,
          estado: 'nuevo',
        })
        .select('id')
        .single()
      if (err) throw err

      // Register items in mesonero account (non-blocking)
      fetch('/api/mesonero/cuentas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mesa: String(params.mesa), items: params.items }),
      }).catch(() => {})

      return data.id
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el pedido')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { submit, loading, error }
}
