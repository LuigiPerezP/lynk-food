'use client'

import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'
import type { Order } from '../types'

function startOfToday(): Timestamp {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return Timestamp.fromDate(d)
}

export function useDailyOrders(restauranteId: string) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ref = collection(db, 'restaurante', restauranteId, 'pedidos')
    const q = query(ref, where('creadoEn', '>=', startOfToday()))

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => {
        const raw = d.data()
        return {
          id: d.id,
          ...raw,
          creadoEn: raw.creadoEn?.toDate(),
          actualizadoEn: raw.actualizadoEn?.toDate(),
        } as Order
      })
      setOrders(data)
      setLoading(false)
    })

    return () => unsub()
  }, [restauranteId])

  return { orders, loading }
}
