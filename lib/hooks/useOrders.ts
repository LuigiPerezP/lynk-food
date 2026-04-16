'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import type { Order, OrderStatus } from '../types'

const ACTIVE_STATUSES: OrderStatus[] = ['nuevo', 'preparando', 'listo']
const MAX_RETRIES = 5
const RETRY_BASE_MS = 2000

export function useOrders(restauranteId: string, estados: OrderStatus[] = ACTIVE_STATUSES) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Stringify to avoid stale array reference in deps
  const estadosKey = estados.join(',')

  const retry = useCallback(() => {
    setError(null)
    setLoading(true)
    setRetryCount((n) => n + 1)
  }, [])

  useEffect(() => {
    const ref = collection(db, 'restaurante', restauranteId, 'pedidos')
    const q = query(ref, where('estado', 'in', estadosKey.split(',')))

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (retryTimer.current) clearTimeout(retryTimer.current)
        const pedidos = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            creadoEn: data.creadoEn?.toDate(),
            actualizadoEn: data.actualizadoEn?.toDate(),
          } as Order
        })
        // Ordenar por fecha descendente en cliente (evita índice compuesto en Firestore)
        pedidos.sort((a, b) => (b.creadoEn?.getTime() ?? 0) - (a.creadoEn?.getTime() ?? 0))
        setOrders(pedidos)
        setLoading(false)
        setError(null)
      },
      (err) => {
        setLoading(false)
        if (retryCount < MAX_RETRIES) {
          const delay = RETRY_BASE_MS * Math.pow(2, retryCount)
          setError(`Sin conexión. Reintentando en ${Math.round(delay / 1000)}s…`)
          retryTimer.current = setTimeout(() => setRetryCount((n) => n + 1), delay)
        } else {
          setError('No se pudo conectar. Verifica tu conexión a internet.')
        }
      }
    )

    return () => {
      unsubscribe()
      if (retryTimer.current) clearTimeout(retryTimer.current)
    }
  }, [restauranteId, estadosKey, retryCount])

  return { orders, loading, error, retry }
}
