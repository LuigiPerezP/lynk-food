'use client'

import { useState } from 'react'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import type { OrderStatus } from '../types'

export function useUpdateOrderStatus(restauranteId: string) {
  const [loading, setLoading] = useState<string | null>(null)

  async function updateStatus(orderId: string, estado: OrderStatus) {
    setLoading(orderId)
    try {
      const ref = doc(db, 'restaurante', restauranteId, 'pedidos', orderId)
      await updateDoc(ref, { estado, actualizadoEn: serverTimestamp() })
    } finally {
      setLoading(null)
    }
  }

  return { updateStatus, loading }
}
