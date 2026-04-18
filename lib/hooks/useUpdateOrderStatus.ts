'use client'

import { useState } from 'react'
import { supabase } from '../supabase'
import type { OrderStatus } from '../types'

export function useUpdateOrderStatus(_restauranteId: string) {
  const [loading, setLoading] = useState<string | null>(null)

  async function updateStatus(orderId: string, estado: OrderStatus) {
    setLoading(orderId)
    try {
      await supabase
        .from('pedidos')
        .update({ estado, updated_at: new Date().toISOString() })
        .eq('id', orderId)
    } finally {
      setLoading(null)
    }
  }

  return { updateStatus, loading }
}
