'use client'

import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import type { Order, OrderItem } from '../types'

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
      const ref = collection(db, 'restaurante', params.restauranteId, 'pedidos')
      const docRef = await addDoc(ref, {
        mesa: params.mesa,
        items: params.items,
        notas: params.notas,
        estado: 'nuevo',
        creadoEn: serverTimestamp(),
        actualizadoEn: serverTimestamp(),
      } satisfies Omit<Order, 'id' | 'creadoEn' | 'actualizadoEn'> & { creadoEn: unknown; actualizadoEn: unknown })
      return docRef.id
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el pedido')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { submit, loading, error }
}
